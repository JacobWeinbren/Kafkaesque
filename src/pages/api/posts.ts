// /api/posts.ts
import type { APIRoute } from "astro";
import { getPosts } from "@/lib/hashnode";

export const GET: APIRoute = async ({ request }) => {
	const url = new URL(request.url);
	const cursor = url.searchParams.get("cursor");
	const postsPerPage = 6;

	try {
		const data = await getPosts({
			limit: postsPerPage,
			after: cursor,
		});

		return new Response(JSON.stringify(data), {
			status: 200,
			headers: {
				"Content-Type": "application/json",
				"Cache-Control": "no-store, no-cache, max-age=0",
			},
		});
	} catch (error) {
		console.error("API error:", error);
		return new Response(
			JSON.stringify({ error: "Failed to fetch posts from source" }),
			{
				status: 500,
				headers: {
					"Content-Type": "application/json",
					"Cache-Control": "no-store",
				},
			}
		);
	}
};
