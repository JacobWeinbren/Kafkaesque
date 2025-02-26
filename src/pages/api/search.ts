// src/pages/api/search.ts - Improved caching
import type { APIRoute } from "astro";
import { getAllPosts } from "@/lib/hashnode";
import Fuse from "fuse.js";

const fuseCache = new WeakMap();
let postsCache: any = null;
let lastUpdated = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour for production

export const GET: APIRoute = async ({ url, request }) => {
	const query = url.searchParams.get("q");

	// Check for browser cache first using Etag
	const browserCacheHeader = request.headers.get("if-none-match");
	const cacheEtag = `"search-${query}-${lastUpdated}"`;

	if (browserCacheHeader === cacheEtag) {
		return new Response(null, {
			status: 304,
			headers: {
				ETag: cacheEtag,
				"Cache-Control": "public, max-age=300",
			},
		});
	}

	if (!query) {
		return new Response(JSON.stringify([]), {
			status: 200,
			headers: {
				"Content-Type": "application/json",
				"Cache-Control": "public, max-age=300",
				ETag: cacheEtag,
			},
		});
	}

	try {
		const now = Date.now();
		if (!postsCache || now - lastUpdated > CACHE_DURATION) {
			const posts = await getAllPosts();
			postsCache = posts;
			lastUpdated = now;
			fuseCache.set(
				postsCache,
				new Fuse(posts, {
					keys: ["title", "brief", "content"],
					threshold: 0.3,
					includeScore: true,
				})
			);
		}

		const fuse = fuseCache.get(postsCache);
		if (!fuse) throw new Error("Search index not initialized");

		const results = fuse
			.search(query)
			.filter((result) => result.score && result.score < 0.7)
			.map((result) => result.item)
			.slice(0, 9);

		return new Response(JSON.stringify(results), {
			status: 200,
			headers: {
				"Content-Type": "application/json",
				"Cache-Control": "public, max-age=300",
				ETag: cacheEtag,
			},
		});
	} catch (error: any) {
		console.error("Search error:", error);
		return new Response(
			JSON.stringify({ error: "Search failed", message: error.message }),
			{ status: 500, headers: { "Content-Type": "application/json" } }
		);
	}
};
