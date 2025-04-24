// src/routes/post/[slug]/+page.server.ts
import { error } from "@sveltejs/kit";
import { getPost } from "$lib/server/hashnode";
import type { PageServerLoad } from "./$types";
// Import the type for assertion
import type { LayoutDataShape } from "../../+layout";

export const load: PageServerLoad = async ({ params, parent }) => {
	const { slug } = params;
	console.log(`[+page.server.ts] Loading post with slug: ${slug}`);

	let layoutUrlData: LayoutDataShape["url"] | null = null; // Initialize as null

	try {
		console.log("[+page.server.ts] Calling await parent()...");
		const rawParentData = await parent(); // Get the raw data
		console.log(
			"[+page.server.ts] RAW data received from parent():",
			JSON.stringify(rawParentData)
		);

		// First, check if it's a non-null object
		if (
			rawParentData &&
			typeof rawParentData === "object" &&
			rawParentData !== null
		) {
			// Assert the type AFTER confirming it's an object to help TypeScript
			const potentialParentData =
				rawParentData as Partial<LayoutDataShape>;

			// Now check if the 'url' property and its nested properties exist and are valid
			if (
				potentialParentData.url && // Check url exists
				typeof potentialParentData.url === "object" && // Check url is object
				potentialParentData.url !== null && // Check url is not null
				potentialParentData.url.origin && // Check origin is truthy
				potentialParentData.url.href && // Check href is truthy
				potentialParentData.url.pathname // Check pathname is truthy
			) {
				// If valid, store the url object
				layoutUrlData =
					potentialParentData.url as LayoutDataShape["url"]; // Can safely cast here
				console.log(
					"[+page.server.ts] Parent data appears valid:",
					layoutUrlData
				);
			} else {
				// If structure is invalid, log warning
				console.warn(
					"[+page.server.ts] Parent data received is not the expected shape or missing origin/href/pathname:",
					rawParentData
				);
				layoutUrlData = null;
			}
		} else {
			// If rawParentData isn't even an object, log warning
			console.warn(
				"[+page.server.ts] Parent data received is not an object:",
				rawParentData
			);
			layoutUrlData = null;
		}
	} catch (err: any) {
		// Log error during parent() call but don't throw 500 here for this specific reason
		console.error(
			"[+page.server.ts] Error during await parent() call:",
			err
		);
		layoutUrlData = null; // Ensure layoutUrlData is null on error
	}

	// --- Fetch the post ---
	try {
		const post = await getPost(slug);
		if (!post) {
			// Still throw 404 if post itself isn't found
			error(404, "Post not found");
		}

		console.log(
			`[+page.server.ts] Post found for slug: ${slug}. Title: ${post.title}`
		);

		// Return post and whatever layoutUrlData we determined (could be null)
		console.log(
			"[+page.server.ts] Returning post and layoutUrlData:",
			layoutUrlData
		);
		return {
			post: post,
			url: layoutUrlData, // Pass the url object (or null) to the page
		};
	} catch (err: any) {
		// Throw 500 only if fetching the actual post fails
		console.error(`[+page.server.ts] Error fetching post ${slug}:`, err);
		error(500, `Failed to load post: ${err.message || "Unknown error"}`);
	}
};
