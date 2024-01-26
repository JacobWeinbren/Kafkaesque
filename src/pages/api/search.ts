import { getBlogPosts } from "@/lib/ghost";
import Fuse from "fuse.js";

export const GET = async ({ params, request }) => {
	const url = new URL(request.url);
	const query = url.searchParams.get("query");
	console.log(query);
	const allPosts = await getBlogPosts({
		title: true,
		slug: true,
		excerpt: true,
		published_at: true,
		feature_image: true,
	});

	const fuse = new Fuse(allPosts, {
		keys: ["title", "html"],
		threshold: 0.4,
	});

	const results = fuse.search(query).map((result) => result.item);
	return new Response(JSON.stringify(results), {
		headers: {
			"Content-Type": "application/json",
		},
	});
};
