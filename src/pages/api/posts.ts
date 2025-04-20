// src/pages/api/posts.ts
import type { APIRoute } from "astro";
import { getPosts } from "@/lib/hashnode"; // Import your Hashnode fetch function

export const GET: APIRoute = async ({ request }) => {
	const url = new URL(request.url);
	const cursor = url.searchParams.get("cursor");
	const postsPerPage = 6;

	console.log(`API route /api/posts called. Cursor: ${cursor}`);

	try {
		// Special handling for initial load - fetch more posts
		if (!cursor) {
			// For the initial load, fetch more posts to ensure we get a good sample
			const data = await getPosts({
				limit: 12, // Get more posts initially
				after: null,
			});

			// Return the response
			const headers = new Headers({
				"Content-Type": "application/json",
				"Cache-Control": "no-cache, no-store, must-revalidate",
				Pragma: "no-cache",
				Expires: "0",
			});

			return new Response(JSON.stringify(data), {
				status: 200,
				headers: headers,
			});
		} else {
			// Normal pagination for subsequent requests
			const data = await getPosts({
				limit: postsPerPage,
				after: cursor,
			});

			const headers = new Headers({
				"Content-Type": "application/json",
				"Cache-Control": "no-cache, no-store, must-revalidate",
				Pragma: "no-cache",
				Expires: "0",
			});

			return new Response(JSON.stringify(data), {
				status: 200,
				headers: headers,
			});
		}
	} catch (error) {
		console.error("API route /api/posts error:", error);
		return new Response(
			JSON.stringify({ error: "Failed to fetch posts from source" }),
			{
				status: 500,
				headers: {
					"Content-Type": "application/json",
					"Cache-Control": "no-cache, no-store, must-revalidate",
				},
			}
		);
	}
};
