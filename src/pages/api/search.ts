// src/pages/api/search.ts
import type { APIRoute } from "astro";
import { getPosts } from "@/lib/hashnode";
import Fuse from "fuse.js";

// Improved caching mechanism
let fuseCache: {
	instance: Fuse<any> | null;
	lastUpdated: number;
	posts: any[];
} = {
	instance: null,
	lastUpdated: 0,
	posts: [],
};

const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

export const GET: APIRoute = async ({ url }) => {
	const query = url.searchParams.get("q");

	if (!query) {
		return new Response(JSON.stringify([]), {
			status: 200,
			headers: {
				"Content-Type": "application/json",
				"Cache-Control": "public, max-age=300",
			},
		});
	}

	try {
		const now = Date.now();
		if (
			!fuseCache.instance ||
			now - fuseCache.lastUpdated > CACHE_DURATION
		) {
			const { posts } = await getPosts();
			fuseCache.posts = posts;
			fuseCache.instance = new Fuse(posts, {
				keys: ["title", "brief", "content"],
				threshold: 0.3,
				includeScore: true,
			});
			fuseCache.lastUpdated = now;
		}

		if (!fuseCache.instance) {
			throw new Error("Failed to initialize search");
		}

		const results = fuseCache.instance
			.search(query)
			.filter((result) => result.score && result.score < 0.7)
			.map((result) => result.item);

		return new Response(JSON.stringify(results.slice(0, 9)), {
			status: 200,
			headers: {
				"Content-Type": "application/json",
				"Cache-Control": "public, max-age=300",
			},
		});
	} catch (error) {
		console.error("Search error:", error);
		return new Response(
			JSON.stringify({ error: "Search failed", message: error.message }),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			}
		);
	}
};
