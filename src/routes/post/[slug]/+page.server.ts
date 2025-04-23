import { error } from "@sveltejs/kit";
// 1. Import the correct type for the server load function
import type { PageServerLoad } from "./$types";
import { getPost, type HashnodePost } from "$lib/server/hashnode"; // Use server path

// 2. Apply the PageServerLoad type to the function
export const load: PageServerLoad = async ({ params }) => {
	// TypeScript now knows 'params' has a 'slug' property (string | undefined)
	const slug = params.slug;

	if (!slug) {
		// Use SvelteKit's error helper, which correctly throws
		error(400, "Missing post slug");
	}

	const post = await getPost(slug);

	if (!post) {
		console.error(`+page.server.ts: Post not found for slug: ${slug}`);
		error(404, "Post not found");
	}

	// Return the raw post data. Image optimization happens via proxy.
	// The 'post' key here defines the shape of the 'data.post' prop in +page.svelte
	return {
		post: post, // No need to cast here if getPost returns HashnodePost | null and we checked for null
	};
};
