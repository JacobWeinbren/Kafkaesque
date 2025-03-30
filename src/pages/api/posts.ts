// src/pages/api/posts.ts
import type { APIRoute } from "astro";
import { getPosts } from "@/lib/hashnode"; // Import your Hashnode fetch function

export const GET: APIRoute = async ({ request }) => {
	const url = new URL(request.url);
	const cursor = url.searchParams.get("cursor"); // Get cursor from query param

	// Define how many posts to load per request (initial and subsequent)
	const postsPerPage = 6;

	console.log(`API route /api/posts called. Cursor: ${cursor}`);

	try {
		// Call your existing getPosts function from hashnode.ts
		const data = await getPosts({
			limit: postsPerPage,
			after: cursor, // Pass cursor (will be null for the first request)
		});

		// Prepare headers for the API response - prevent caching of this API route itself
		const headers = new Headers({
			"Content-Type": "application/json",
			"Cache-Control": "no-cache, no-store, must-revalidate", // Prevent caching of the API response
			Pragma: "no-cache",
			Expires: "0",
		});

		// Return the data fetched from Hashnode
		return new Response(JSON.stringify(data), {
			status: 200,
			headers: headers,
		});
	} catch (error) {
		console.error("API route /api/posts error:", error);
		// Return a server error response
		return new Response(
			JSON.stringify({ error: "Failed to fetch posts from source" }),
			{
				status: 500,
				headers: {
					"Content-Type": "application/json",
					"Cache-Control": "no-cache, no-store, must-revalidate", // Also prevent caching on error
				},
			}
		);
	}
};
