import { TSGhostContentAPI } from "@ts-ghost/content-api";

const api = new TSGhostContentAPI(
	"https://kafkaesque.digitalpress.blog",
	import.meta.env.GHOST_CONTENT_API_KEY || "",
	"v5.47.0"
);

export async function getBlogPosts() {
	const response = await api.posts
		.browse({
			limit: 10,
		})
		.fields({
			title: true,
			slug: true,
			id: true,
			reading_time: true,
			feature_image: true,
			html: true,
		})
		.fetch();
	if (!response.success) {
		const errorResponse = response as {
			success: false;
			errors: { message: string; type: string }[];
		};
		console.error(errorResponse.errors.map((e) => e.message).join(", "));
		return [];
	}
	return response.data;
}
