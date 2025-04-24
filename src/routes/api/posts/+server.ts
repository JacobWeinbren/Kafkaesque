// src/routes/api/posts/+server.ts

import { json, error } from "@sveltejs/kit";
import { getPosts, type OriginalPostsResponse } from "$lib/server/hashnode";

export async function GET({ url }) {
	const cursor = url.searchParams.get("cursor");
	const postsPerPage = 6; // Or make configurable

	// console.log(`[API /api/posts] Fetching posts. Cursor: ${cursor}`); // Keep or remove debug logs

	try {
		const responseData: OriginalPostsResponse = await getPosts({
			limit: postsPerPage,
			after: cursor,
		});

		// if (responseData.posts && responseData.posts.length > 0) {
		// 	console.log(`[API /api/posts] Received ${responseData.posts.length} posts. First post title: ${responseData.posts[0].title}`);
		// } else {
		// 	console.log("[API /api/posts] Received no posts from getPosts.");
		// }

		return json(responseData, {
			headers: {
				// Cache for 60 seconds, allow stale for a day
				"Cache-Control":
					"public, max-age=60, stale-while-revalidate=86400",
			},
		});
	} catch (err: any) {
		console.error("[API /api/posts] Error calling getPosts:", err);
		error(500, `Failed to fetch posts: ${err.message || "Unknown error"}`);
	}
}
