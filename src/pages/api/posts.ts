import type { APIRoute } from "astro";
import { getPosts } from "@/lib/hashnode";

export const GET: APIRoute = async ({ request }) => {
	const url = new URL(request.url);
	const cursor = url.searchParams.get("cursor");
	const postsPerPage = 6;

	try {
		// Fetch posts using the optimized function
		const data = await getPosts({
			limit: postsPerPage,
			after: cursor,
		});

		// FIXED: Additional validation to prevent infinite loops
		if (data.posts.length === 0) {
			data.hasMore = false;
			data.endCursor = null;
		}

		// FIXED: Set cache headers to prevent stale data causing issues
		const headers = new Headers({
			"Content-Type": "application/json",
			"Cache-Control": "no-cache, private",
		});

		return new Response(JSON.stringify(data), {
			status: 200,
			headers: headers,
		});
	} catch (error) {
		console.error("API route /api/posts error:", error);
		return new Response(
			JSON.stringify({ error: "Failed to fetch posts from source" }),
			{
				status: 500,
				headers: {
					"Content-Type": "application/json",
					"Cache-Control": "no-cache, private",
				},
			}
		);
	}
};
