import { error } from "@sveltejs/kit";
import { getPost } from "$lib/server/hashnode";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
	const { slug } = params;
	console.log(`Loading post with slug: ${slug}`);

	try {
		const post = await getPost(slug);
		if (!post) {
			error(404, "Post not found");
		}

		console.log(`Post found for slug: ${slug}. Title: ${post.title}`);

		return {
			post: post,
		};
	} catch (err: any) {
		console.error(`Error fetching post ${slug}:`, err);
		error(500, `Failed to load post: ${err.message || "Unknown error"}`);
	}
};
