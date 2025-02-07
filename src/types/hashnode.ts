export interface HashnodePost {
	id: string;
	slug: string;
	title: string;
	subtitle: string;
	content: string;
	brief: string;
	coverImage: string | null;
	publishedAt: string;
	tags?: { name: string; slug: string }[];
}

export interface GetPostsOptions {
	limit?: number;
	after?: string;
}

export interface PostsResponse {
	posts: HashnodePost[];
	hasMore: boolean;
	endCursor?: string;
}
