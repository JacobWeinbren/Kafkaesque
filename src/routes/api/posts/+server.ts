import { json, error } from "@sveltejs/kit";
import { getPosts, type OriginalPostsResponse } from "$lib/server/hashnode";

export async function GET({ url }) {
	const cursor = url.searchParams.get("cursor");
	const postsPerPage = 6; // Or make configurable

	try {
		console.log(`API /api/posts: Fetching posts with cursor: ${cursor}`);
		const responseData: OriginalPostsResponse = await getPosts({
			limit: postsPerPage,
			after: cursor,
		});

		console.log(
			`API /api/posts: Fetched ${responseData.posts.length} posts. HasMore: ${responseData.hasMore}`
		);

		// Return the raw data including original image URLs
		return json(responseData, {
			headers: {
				// Cache for 5 mins, allow stale for a day
				"Cache-Control":
					"public, max-age=300, stale-while-revalidate=86400",
			},
		});
	} catch (err: any) {
		console.error("API error in /api/posts:", err);
		// Use SvelteKit's error helper for standard error responses
		error(500, "Failed to fetch posts");
	}
}
