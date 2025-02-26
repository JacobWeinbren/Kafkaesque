// src/pages/api/posts.ts
import type { APIRoute } from "astro";
import { getPosts } from "@/lib/hashnode";

export const GET: APIRoute = async ({ url }) => {
	try {
		const cursor = url.searchParams.get("cursor");
		const { posts, hasMore, endCursor } = await getPosts({
			limit: 9,
			after: cursor === "null" ? null : cursor,
		});
		return new Response(JSON.stringify({ posts, hasMore, endCursor }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error: any) {
		console.error("API Error:", error);
		return new Response(
			JSON.stringify({
				error: "Failed to fetch posts",
				details:
					error instanceof Error ? error.message : "Unknown error",
			}),
			{ status: 500, headers: { "Content-Type": "application/json" } }
		);
	}
};
