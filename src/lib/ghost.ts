import { TSGhostContentAPI } from "@ts-ghost/content-api";

const api = new TSGhostContentAPI(
	"https://kafkaesque.digitalpress.blog",
	import.meta.env.PUBLIC_CONTENT_API_KEY || "",
	"v5.47.0"
);

async function fetchPosts(options: any) {
	const response = await api.posts.browse(options).fetch();

	if (!response.success) {
		const errorResponse = response as {
			success: false;
			errors: { message: string; type: string }[];
		};
		console.error(errorResponse.errors.map((e) => e.message).join(", "));
		return { data: [], error: true };
	}
	return { data: response.data, error: false };
}

export async function getBlogPosts(
	fields = {},
	limit: number | "all" = "all",
	tagFilter?: string
) {
	let options: any = {
		limit,
		fields,
		...(tagFilter && { filter: `tags:${tagFilter}` }),
	};

	const { data, error } = await fetchPosts(options);
	return error ? [] : data;
}

export async function loadMorePosts(
	page: number,
	limit: number = 10,
	fields = {},
	tagFilter?: string
) {
	let options: any = {
		limit,
		fields,
		page,
		...(tagFilter && { filter: `tags:${tagFilter}` }),
	};

	const { data, error } = await fetchPosts(options);
	return { posts: data, error };
}
