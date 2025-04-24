// src/routes/api/posts/+server.ts

import { json, error } from "@sveltejs/kit";
import { getPosts, type OriginalPostsResponse } from "$lib/server/hashnode";

export async function GET({ url, setHeaders }) {
	// Get cursor from query params
	const cursorParam = url.searchParams.get("cursor");
	const postsPerPage = 9; // Or make configurable

	// Determine if this is the initial load request (no cursor provided)
	const isInitialLoadRequest = !cursorParam;

	// The cursor to pass to Hashnode is null for initial load, otherwise the param
	const cursorForHashnode = cursorParam; // Pass null or the actual cursor string

	console.log(
		`[API /api/posts] Request type: ${
			isInitialLoadRequest ? "Initial Load" : "Paginated"
		}. Cursor for Hashnode: ${cursorForHashnode}`
	);

	try {
		// Fetch posts from Hashnode service
		const responseData: OriginalPostsResponse = await getPosts({
			limit: postsPerPage,
			after: cursorForHashnode, // Use null for initial, string for subsequent
		});

		// --- Set Cache Headers Conditionally ---
		if (isInitialLoadRequest) {
			// For the initial load (no cursor), be aggressive: don't cache.
			console.log(
				"[API /api/posts] Setting NO-CACHE headers for initial load."
			);
			setHeaders({
				"Cache-Control": "no-cache, max-age=0, must-revalidate",
				// Optional: Pragma and Expires for older HTTP/1.0 caches
				// 'Pragma': 'no-cache',
				// 'Expires': '0'
			});
		} else {
			// For subsequent paginated loads (cursor present), allow caching.
			console.log(
				"[API /api/posts] Setting standard cache headers for paginated load."
			);
			setHeaders({
				"Cache-Control":
					"public, max-age=60, stale-while-revalidate=86400",
			});
		}
		// --- End Cache Header Logic ---

		// Optional logging
		console.log(
			`[API /api/posts] Response: ${responseData.posts?.length} posts, hasMore: ${responseData.hasMore}, endCursor: ${responseData.endCursor}`
		);
		// Return the data using SvelteKit's json helper
		return json(responseData);
	} catch (err: any) {
		console.error(
			`[API /api/posts] Error calling getPosts (cursor: ${cursorForHashnode}):`,
			err
		);
		// Ensure error responses are not cached
		setHeaders({
			"Cache-Control": "no-store", // Completely prevent caching for errors
		});
		error(500, `Failed to fetch posts: ${err.message || "Unknown error"}`);
	}
}
