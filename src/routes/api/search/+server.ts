// search/+server.ts
import { json, error } from "@sveltejs/kit";
import { getAllPosts, type HashnodePost } from "$lib/server/hashnode";
import Fuse from "fuse.js";

// --- Caching ---
interface CacheEntry {
	posts: HashnodePost[];
	fuse: Fuse<HashnodePost>;
	lastUpdated: number;
	etag: string;
}
let searchCache: CacheEntry | null = null;
const CACHE_DURATION = 1000 * 60 * 30; // Cache posts data for 30 minutes

// --- Stricter Search Configuration ---
const FUSE_THRESHOLD = 0.35; // Lowered from 0.4 for stricter matching
const SCORE_CUTOFF = 0.4; // Maximum allowed score (lower is better match) - results above this will be filtered out
const MIN_MATCH_LENGTH = 3; // Optional: Increase minimum characters slightly
// --- End Configuration ---

async function getSearchIndex(): Promise<CacheEntry> {
	const now = Date.now();
	if (searchCache && now - searchCache.lastUpdated < CACHE_DURATION) {
		console.log("API /api/search: Using cached index.");
		return searchCache;
	}

	console.log(
		"API /api/search: Cache expired or missing, fetching all posts (including content)..."
	);
	try {
		const posts = await getAllPosts();
		console.log(
			`API /api/search: Fetched ${posts.length} posts for indexing.`
		);

		const fuse = new Fuse(posts, {
			keys: [
				{ name: "title", weight: 0.6 },
				{ name: "subtitle", weight: 0.3 },
				{ name: "tags.name", weight: 0.3 },
				{ name: "brief", weight: 0.2 },
				{ name: "content", weight: 0.1 },
			],
			threshold: FUSE_THRESHOLD, // Use the stricter threshold
			includeScore: true, // Keep this true to filter by score later
			minMatchCharLength: MIN_MATCH_LENGTH, // Use updated min length
			ignoreLocation: true,
		});

		const newEtag = `"search-index-${now}"`;
		searchCache = { posts, fuse, lastUpdated: now, etag: newEtag };
		console.log(
			`API /api/search: Index created and cached (Threshold: ${FUSE_THRESHOLD}, MinLength: ${MIN_MATCH_LENGTH}).`
		);
		return searchCache;
	} catch (err) {
		console.error("API /api/search: Failed to build search index:", err);
		searchCache = null;
		throw new Error("Failed to initialize search index");
	}
}

export async function GET({ url, request }) {
	const query = url.searchParams.get("q");

	// Keep the minimum query length check consistent or adjust if needed
	if (!query || query.trim().length < MIN_MATCH_LENGTH) {
		return json([], {
			headers: { "Cache-Control": "public, max-age=60" },
		});
	}

	try {
		const index = await getSearchIndex();

		// --- ETag Caching ---
		const browserEtag = request.headers.get("if-none-match");
		const currentEtag = `"search-${query}-${index.etag}"`;

		if (browserEtag === currentEtag) {
			console.log(
				`API /api/search: ETag match for query "${query}", returning 304.`
			);
			return new Response(null, {
				status: 304,
				headers: {
					ETag: currentEtag,
					"Cache-Control": "public, max-age=300",
				},
			});
		}
		// --- End ETag ---

		console.log(`API /api/search: Performing search for query: "${query}"`);
		const rawResults = index.fuse.search(query.trim());

		// --- Filter by Score ---
		const filteredResults = rawResults
			.filter((result) => result.score && result.score <= SCORE_CUTOFF)
			.map((result) => result.item) // Extract the original post item after filtering
			.slice(0, 15); // Limit number of results
		// --- End Score Filter ---

		console.log(
			`API /api/search: Found ${rawResults.length} raw results, ${filteredResults.length} results after score filter (<= ${SCORE_CUTOFF}) for query "${query}".`
		);

		return json(filteredResults, {
			// Return the filtered results
			headers: {
				"Content-Type": "application/json",
				"Cache-Control": "public, max-age=300",
				ETag: currentEtag,
			},
		});
	} catch (err: any) {
		console.error(`API /api/search: Error searching for "${query}":`, err);
		error(500, err.message || "Search failed");
	}
}
