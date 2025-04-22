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

async function getSearchIndex(): Promise<CacheEntry> {
	const now = Date.now();
	if (searchCache && now - searchCache.lastUpdated < CACHE_DURATION) {
		console.log("API /api/search: Using cached index.");
		return searchCache;
	}

	console.log(
		"API /api/search: Cache expired or missing, fetching all posts..."
	);
	try {
		const posts = await getAllPosts();
		console.log(
			`API /api/search: Fetched ${posts.length} posts for indexing.`
		);

		const fuse = new Fuse(posts, {
			keys: [
				{ name: "title", weight: 0.6 }, // Prioritize title
				{ name: "subtitle", weight: 0.3 },
				{ name: "brief", weight: 0.3 },
				// { name: 'tags.name', weight: 0.2 }, // Add if tags are fetched & relevant
				// { name: 'content', weight: 0.1 } // Add if full content is fetched (careful!)
			],
			threshold: 0.4, // Adjust threshold (lower is stricter)
			includeScore: true,
			minMatchCharLength: 2, // Minimum characters to match
			ignoreLocation: true, // Search whole strings
		});

		const newEtag = `"search-index-${now}"`;
		searchCache = { posts, fuse, lastUpdated: now, etag: newEtag };
		console.log("API /api/search: Index created and cached.");
		return searchCache;
	} catch (err) {
		console.error("API /api/search: Failed to build search index:", err);
		// If index fails, clear cache and throw
		searchCache = null;
		throw new Error("Failed to initialize search index");
	}
}

export async function GET({ url, request }) {
	const query = url.searchParams.get("q");

	if (!query || query.trim().length < 2) {
		// Return empty array if query is missing or too short
		return json([], {
			headers: { "Cache-Control": "public, max-age=60" }, // Cache short queries briefly
		});
	}

	try {
		const index = await getSearchIndex();

		// --- ETag Caching ---
		const browserEtag = request.headers.get("if-none-match");
		// Use a query-specific ETag based on the index ETag
		const currentEtag = `"search-${query}-${index.etag}"`;

		if (browserEtag === currentEtag) {
			console.log(
				`API /api/search: ETag match for query "${query}", returning 304.`
			);
			return new Response(null, {
				status: 304,
				headers: {
					ETag: currentEtag,
					"Cache-Control": "public, max-age=300", // Cache results for 5 mins
				},
			});
		}
		// --- End ETag ---

		console.log(`API /api/search: Performing search for query: "${query}"`);
		const results = index.fuse
			.search(query.trim())
			// Optional: Filter by score if needed (lower score is better)
			// .filter((result) => result.score && result.score < 0.6)
			.map((result) => result.item) // Extract the original post item
			.slice(0, 12); // Limit number of results

		console.log(
			`API /api/search: Found ${results.length} results for query "${query}".`
		);

		return json(results, {
			headers: {
				"Content-Type": "application/json",
				"Cache-Control": "public, max-age=300", // Cache results for 5 mins
				ETag: currentEtag, // Send the new ETag
			},
		});
	} catch (err: any) {
		console.error(`API /api/search: Error searching for "${query}":`, err);
		error(500, err.message || "Search failed");
	}
}
