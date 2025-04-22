import type { APIRoute } from "astro";
import { getPosts } from "@/lib/hashnode";

export const GET: APIRoute = async ({ request }) => {
	const url = new URL(request.url);
	const cursor = url.searchParams.get("cursor");
	const postsPerPage = 6;

	try {
		console.log(`API route called with cursor: ${cursor || "null"}`);

		// Fetch posts using the fixed function
		const data = await getPosts({
			limit: postsPerPage,
			after: cursor,
		});

		console.log(
			`API route returning: ${data.posts.length} posts, hasMore=${
				data.hasMore
			}, endCursor=${data.endCursor || "null"}`
		);

		const headers = new Headers({
			"Content-Type": "application/json",
			"Cache-Control": "no-cache",
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
					"Cache-Control": "no-cache",
				},
			}
		);
	}
};
