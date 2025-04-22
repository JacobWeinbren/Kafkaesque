// /api/posts.ts
import type { APIRoute } from "astro";
import { getPosts, resetTracking } from "@/lib/hashnode";

export const GET: APIRoute = async ({ request }) => {
	const url = new URL(request.url);
	const cursor = url.searchParams.get("cursor");
	const postsPerPage = 6;

	try {
		console.log(`API route called with cursor: ${cursor || "null"}`);

		// Reset tracking when no cursor is provided (initial request)
		if (!cursor) {
			resetTracking();
			console.log("Resetting post tracking for fresh request");
		}

		// Fetch posts using our fixed function
		const data = await getPosts({
			limit: postsPerPage,
			after: cursor,
		});

		console.log(
			`API route returning: ${data.posts.length} posts, hasMore=${
				data.hasMore
			}, endCursor=${data.endCursor || "null"}`
		);

		// Strong cache control headers
		const headers = new Headers({
			"Content-Type": "application/json",
			"Cache-Control":
				"no-store, no-cache, must-revalidate, proxy-revalidate",
			Pragma: "no-cache",
			Expires: "0",
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
					"Cache-Control": "no-store, no-cache, must-revalidate",
				},
			}
		);
	}
};
