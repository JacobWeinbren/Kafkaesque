// src/routes/post/[slug]/+page.server.ts
import { error } from "@sveltejs/kit";
import { getPost } from "$lib/server/hashnode"; // Make sure this path is correct
import type { PageServerLoad } from "./$types";
// Import type for reference
import type { LayoutDataShape } from "../../+layout";

export const load: PageServerLoad = async ({ params, parent }) => {
	const { slug } = params;
	console.log(`[+page.server.ts] Loading post with slug: ${slug}`);

	// --- Get data from parent layout ---
	let parentDataResult: any = {}; // Initialize with an empty object

	try {
		console.log("[+page.server.ts] Calling await parent()...");
		parentDataResult = await parent(); // Get the raw data
		console.log(
			"[+page.server.ts] RAW data received from parent():",
			JSON.stringify(parentDataResult) // Log the stringified raw data
		);
		console.log(
			"[+page.server.ts] Type of parentDataResult:",
			typeof parentDataResult // Log its type
		);
	} catch (err: any) {
		// Catch potential errors during the parent() call itself
		console.error("[+page.server.ts] Error during await parent():", err);
		// Don't throw immediately, let's see if we can proceed
		parentDataResult = { errorLoadingParent: true, details: err }; // Store error info
	}

	// --- Fetch the post (regardless of parent data outcome for now) ---
	try {
		const post = await getPost(slug);

		if (!post) {
			console.error(`[+page.server.ts] Post not found for slug: ${slug}`);
			// Still throw 404 if post not found
			error(404, "Post not found");
		}

		console.log(
			`[+page.server.ts] Post found for slug: ${slug}. Title: ${post.title}`
		);

		// --- Return post and WHATEVER parent() returned ---
		// We are intentionally skipping validation of parentDataResult here
		// to see if anything other than {} can be passed through.
		// The .svelte page might break if parentDataResult is not the expected shape.
		console.log(
			"[+page.server.ts] Returning post and raw parentDataResult:",
			JSON.stringify(parentDataResult)
		);
		return {
			post: post,
			// Pass the raw result directly. The page component will need to handle it.
			// We rename it slightly to avoid collision if parentDataResult *is* just {}
			layoutData: parentDataResult,
		};
	} catch (err: any) {
		console.error(`[+page.server.ts] Error fetching post ${slug}:`, err);
		// If post fetching fails, throw 500
		error(500, `Failed to load post: ${err.message || "Unknown error"}`);
	}
};
