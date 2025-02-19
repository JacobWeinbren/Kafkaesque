// src/lib/hashnode.ts
import type {
	HashnodePost,
	GetPostsOptions,
	PostsResponse,
} from "@/types/hashnode";

const HASHNODE_ENDPOINT = "https://gql.hashnode.com";

const getHeaders = () => ({
	"Content-Type": "application/json",
	Authorization: `Bearer ${import.meta.env.HASHNODE_ACCESS_TOKEN}`,
});

export async function getPosts(
	options: GetPostsOptions = {}
): Promise<PostsResponse> {
	try {
		const postsQuery = `
      query Publication($first: Int!, $after: String) {
        publication(host: "kafkaesque.hashnode.dev") {
          posts(first: $first, after: $after) {
            edges {
              cursor
              node {
                id
                title
                subtitle
                brief
                slug
                coverImage { url }
                publishedAt
                content { html }
                tags { name slug }
              }
            }
            pageInfo { hasNextPage endCursor }
          }
        }
      }
    `;
		const response = await fetch(HASHNODE_ENDPOINT, {
			method: "POST",
			headers: getHeaders(),
			body: JSON.stringify({
				query: postsQuery,
				variables: {
					first: options.limit || 6,
					after: options.after || null,
				},
			}),
		});
		const json = await response.json();
		if (json.errors) {
			console.error("Posts Query Errors:", json.errors);
			return { posts: [], hasMore: false, endCursor: null };
		}
		const edges = json.data?.publication?.posts?.edges || [];
		const pageInfo = json.data?.publication?.posts?.pageInfo;
		const posts = edges.map((edge: any) => ({
			id: edge.node.id,
			slug: edge.node.slug,
			title: edge.node.title,
			subtitle: edge.node.subtitle || "",
			content: edge.node.content.html,
			brief: edge.node.brief,
			coverImage: edge.node.coverImage?.url || null,
			publishedAt: edge.node.publishedAt,
			tags: edge.node.tags,
		}));
		return {
			posts,
			hasMore: pageInfo?.hasNextPage || false,
			endCursor: pageInfo?.endCursor || null,
		};
	} catch (error) {
		console.error("Failed to fetch posts:", error);
		return { posts: [], hasMore: false, endCursor: null };
	}
}

export async function getPost(slug: string): Promise<HashnodePost | null> {
	try {
		const query = `
      query {
        publication(host: "kafkaesque.hashnode.dev") {
          post(slug: "${slug}") {
            id
            title
            subtitle
            content { html }
            brief
            coverImage { url }
            publishedAt
            tags { name slug }
          }
        }
      }
    `;
		const response = await fetch(HASHNODE_ENDPOINT, {
			method: "POST",
			headers: getHeaders(),
			body: JSON.stringify({ query }),
		});
		const json = await response.json();
		if (json.errors) {
			console.error("GraphQL Errors:", json.errors);
			return null;
		}
		const post = json.data?.publication?.post;
		if (!post) return null;
		return {
			id: post.id,
			slug,
			title: post.title,
			subtitle: post.subtitle || "",
			content: post.content.html,
			brief: post.brief,
			coverImage: post.coverImage?.url || null,
			publishedAt: post.publishedAt,
			tags: post.tags,
		};
	} catch (error) {
		console.error("Failed to fetch post:", error);
		return null;
	}
}

export async function getAllPosts() {
	let allPosts = [];
	let hasMore = true;
	let cursor = null;
	while (hasMore) {
		const {
			posts,
			hasMore: more,
			endCursor,
		} = await getPosts({ limit: 50, after: cursor });
		allPosts = [...allPosts, ...posts];
		hasMore = more;
		cursor = endCursor;
	}
	return allPosts;
}
