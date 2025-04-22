// /api/posts.ts
import type { APIRoute } from "astro";
import { getPosts, resetTracking } from "@/lib/hashnode";

export const prerender = false; // Ensure this is never prerendered

export const GET: APIRoute = async ({ request }) => {
	const url = new URL(request.url);
	const cursor = url.searchParams.get("cursor");
	const postsPerPage = 6;

	// Add timestamp to ensure uniqueness for Vercel's cache
	const timestamp = Date.now();

	try {
		console.log(
			`API route called with cursor: ${cursor || "null"} at ${timestamp}`
		);

		// Reset tracking for initial requests
		if (!cursor) {
			resetTracking();
			console.log("Resetting post tracking for fresh request");
		}

		// Fetch posts from Hashnode
		const data = await getPosts({
			limit: postsPerPage,
			after: cursor,
		});

		console.log(
			`API route returning: ${data.posts.length} posts, hasMore=${
				data.hasMore
			}, endCursor=${data.endCursor || "null"}`
		);

		// Use all the cache-busting headers we can
		const headers = new Headers({
			"Content-Type": "application/json",
			"Cache-Control":
				"no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
			"CDN-Cache-Control": "no-store", // Vercel-specific
			"Vercel-CDN-Cache-Control": "no-store", // Vercel-specific
			"Surrogate-Control": "no-store", // Additional CDN control
			Pragma: "no-cache",
			Expires: "0",
			// Add a unique header to prevent any caching
			"X-Request-Time": timestamp.toString(),
		});

		return new Response(
			JSON.stringify({
				...data,
				// Add timestamp to response too
				timestamp,
			}),
			{
				status: 200,
				headers: headers,
			}
		);
	} catch (error) {
		console.error("API route /api/posts error:", error);
		return new Response(
			JSON.stringify({
				error: "Failed to fetch posts from source",
				timestamp: Date.now(),
			}),
			{
				status: 500,
				headers: {
					"Content-Type": "application/json",
					"Cache-Control": "no-store, no-cache, must-revalidate",
					"CDN-Cache-Control": "no-store",
				},
			}
		);
	}
};
