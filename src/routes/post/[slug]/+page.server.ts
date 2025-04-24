// src/routes/post/[slug]/+page.server.ts
import { getPost } from "$lib/server/hashnode";
import { error } from "@sveltejs/kit";
// Import the specific type for this load function
import type { PageServerLoad } from "./$types";
// Import the type for the parent layout's data (adjust path if needed)
import type { LayoutData } from "../../$types"; // Adjust path if layout is deeper

export const load: PageServerLoad = async ({ params, parent }) => {
	console.log(`[+page.server.ts] Loading post with slug: ${params.slug}`);
	const post = await getPost(params.slug);

	if (!post) {
		console.error(
			`[+page.server.ts] Post not found for slug: ${params.slug}. Throwing 404.`
		);
		error(404, {
			message: `Post not found: ${params.slug}`,
		});
	}

	// Await parent data and cast it to the expected type
	// Note: SvelteKit might infer this automatically in newer versions,
	// but explicit casting can help TypeScript.
	const layoutData = (await parent()) as LayoutData; // Cast to LayoutData

	// Now TypeScript knows layoutData should have a 'url' property
	if (!layoutData.url) {
		console.warn("[+page.server.ts] URL object not found in layout data!");
		// Decide how to handle this - maybe provide a default or log error
	}

	console.log(
		`[+page.server.ts] Post found for slug: ${params.slug}. Title: ${post.title}`
	);
	return {
		post,
		// Access url safely, provide fallback if needed, though layout should provide it
		url: layoutData.url, // Now TypeScript should be happy
	};
};
