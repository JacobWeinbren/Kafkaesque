// src/routes/post/[slug]/+page.server.ts
import { error } from "@sveltejs/kit";
import { getPost } from "$lib/server/hashnode";
import type { PageServerLoad } from "./$types";
// No longer need LayoutDataShape here if we don't re-process the url

export const load: PageServerLoad = async ({ params, parent }) => {
	const { slug } = params;
	console.log(`[+page.server.ts] Loading post with slug: ${slug}`);

	// --- Optional: You can still call parent() if you need other layout data ---
	// try {
	//  console.log("[+page.server.ts] Calling await parent()...");
	//  const parentData = await parent();
	//  console.log("[+page.server.ts] Data received from parent():", parentData);
	//  // Use parentData if needed for something *other* than the URL
	// } catch (err: any) {
	//  console.error("[+page.server.ts] Error during await parent() call:", err);
	//  // Handle error if necessary, but don't let it block post loading unless required
	// }

	// --- Fetch the post ---
	try {
		const post = await getPost(slug);
		if (!post) {
			error(404, "Post not found");
		}

		console.log(
			`[+page.server.ts] Post found for slug: ${slug}. Title: ${post.title}`
		);

		// --- Return ONLY the data specific to this page ---
		// The 'url' object from +layout.ts will be automatically merged
		// into the 'data' prop for +page.svelte by SvelteKit.
		console.log("[+page.server.ts] Returning post data.");
		return {
			post: post,
			// DO NOT return a 'url' key here, let it come from the layout
		};
	} catch (err: any) {
		console.error(`[+page.server.ts] Error fetching post ${slug}:`, err);
		error(500, `Failed to load post: ${err.message || "Unknown error"}`);
	}
};
