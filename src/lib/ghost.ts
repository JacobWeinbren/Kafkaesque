import { TSGhostContentAPI } from "@ts-ghost/content-api";

const api = new TSGhostContentAPI(
	"https://kafkaesque.digitalpress.blog",
	import.meta.env.GHOST_CONTENT_API_KEY || "",
	"v5.47.0"
);

export async function getBlogPosts(
	fields = {},
	limit?: number,
	tagFilter?: string
) {
	let options: any = {
		limit,
		fields,
	};

	if (tagFilter) {
		options.filter = `tags:${tagFilter}`;
	}

	const response = await api.posts.browse(options).fetch();

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
