import { json } from "@sveltejs/kit";
import { getAllPosts } from "$lib/server/hashnode";

interface Post {
	id: string;
	slug: string;
	title: string;
	subtitle: string;
	brief: string;
	content?: string;
	publishedAt: string;
	tags: { name: string }[];
}

// Simple in-memory cache for search data
let searchCache: Post[] | null = null;
let lastCacheUpdate = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

async function getSearchData() {
	const now = Date.now();

	if (!searchCache || now - lastCacheUpdate > CACHE_DURATION) {
		console.log("Refreshing search cache...");
		searchCache = await getAllPosts();
		lastCacheUpdate = now;
	}

	return searchCache;
}

export async function GET({ url }) {
	try {
		const query = url.searchParams.get("q")?.trim();

		if (!query || query.length < 2) {
			return json([]);
		}

		const posts = await getSearchData();
		const searchTerm = query.toLowerCase();

		const results = posts
			.filter((post) => {
				const searchableText = [
					post.title,
					post.subtitle,
					post.brief,
					post.content?.replace(/<[^>]*>/g, ""), // Strip HTML
					...post.tags.map((tag) => tag.name),
				]
					.join(" ")
					.toLowerCase();

				return searchableText.includes(searchTerm);
			})
			.map((post) => ({
				id: post.id,
				slug: post.slug,
				title: post.title,
				subtitle: post.subtitle,
				brief: post.brief,
				publishedAt: post.publishedAt,
			}))
			.sort(
				(a, b) =>
					new Date(b.publishedAt).getTime() -
					new Date(a.publishedAt).getTime()
			)
			.slice(0, 20); // Limit results

		return json(results);
	} catch (error: unknown) {
		console.error("Search API error:", error);
		return json(
			{
				error: "Search failed",
				message:
					error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}
