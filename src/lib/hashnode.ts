// src/lib/hashnode.ts
import type {
	HashnodePost,
	GetPostsOptions,
	PostsResponse,
} from "@/types/hashnode";

const HASHNODE_ENDPOINT = "https://gql.hashnode.com";
const HASHNODE_HOST = "kafkaesque.hashnode.dev";

const getHeaders = () => ({
	"Content-Type": "application/json",
	Authorization: `Bearer ${import.meta.env.HASHNODE_ACCESS_TOKEN}`,
});

// Fetch a list of posts
export async function getPosts(
	options: GetPostsOptions = {}
): Promise<PostsResponse> {
	const { limit = 6, after = null } = options;

	const postsQuery = `
	  query Publication($first: Int!, $after: String, $host: String!) {
		publication(host: $host) {
		  posts(first: $first, after: $after) {
			edges {
			  node {
				id
				title
				subtitle
				slug
				coverImage { url }
				publishedAt
				tags { name slug }
			  }
			}
			pageInfo {
			  hasNextPage
			  endCursor
			}
		  }
		}
	  }
	`;

	try {
		const response = await fetch(HASHNODE_ENDPOINT, {
			method: "POST",
			headers: getHeaders(),
			body: JSON.stringify({
				query: postsQuery,
				variables: {
					first: limit,
					after: after,
					host: HASHNODE_HOST,
				},
			}),
		});

		if (!response.ok) {
			throw new Error(`API request failed: ${response.status}`);
		}

		const json = await response.json();

		if (json.errors) {
			throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
		}

		const publicationData = json.data?.publication;
		if (!publicationData?.posts) {
			return { posts: [], hasMore: false, endCursor: null };
		}

		const edges = publicationData.posts.edges || [];
		const pageInfo = publicationData.posts.pageInfo || {};

		// Map fields
		const posts: HashnodePost[] = edges.map((edge: any) => ({
			id: edge.node.id,
			slug: edge.node.slug,
			title: edge.node.title,
			subtitle: edge.node.subtitle || "",
			content: "",
			brief: "",
			coverImage: edge.node.coverImage?.url
				? `${edge.node.coverImage.url}?format=webp&w=800&h=450&fit=crop`
				: null,
			publishedAt: edge.node.publishedAt,
			tags: edge.node.tags || [],
		}));

		return {
			posts,
			hasMore: !!pageInfo.hasNextPage && posts.length > 0,
			endCursor: pageInfo.endCursor,
		};
	} catch (error) {
		console.error("Failed to fetch posts:", error);
		return { posts: [], hasMore: false, endCursor: null };
	}
}

// Reset state between page loads (only needed for SSR contexts)
export function resetTracking() {
	// No tracking in simplified version
}

// Get a single post by slug
export async function getPost(slug: string): Promise<HashnodePost | null> {
	const query = `
	  query GetPostBySlug($slug: String!, $host: String!) {
		publication(host: $host) {
		  post(slug: $slug) {
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

	try {
		const response = await fetch(HASHNODE_ENDPOINT, {
			method: "POST",
			headers: getHeaders(),
			body: JSON.stringify({
				query: query,
				variables: {
					slug: slug,
					host: HASHNODE_HOST,
				},
			}),
		});

		if (!response.ok) {
			throw new Error(`API request failed: ${response.status}`);
		}

		const json = await response.json();

		if (json.errors) {
			throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
		}

		const postData = json.data?.publication?.post;
		if (!postData) return null;

		return {
			id: postData.id,
			slug,
			title: postData.title,
			subtitle: postData.subtitle || "",
			content: postData.content?.html || "",
			brief: postData.brief || "",
			coverImage: postData.coverImage?.url
				? `${postData.coverImage.url}?format=webp&w=1200&h=675&fit=crop`
				: null,
			publishedAt: postData.publishedAt,
			tags: postData.tags || [],
		};
	} catch (error) {
		console.error(`Failed to fetch post "${slug}":`, error);
		return null;
	}
}

// Get all posts (simplified)
export async function getAllPosts(): Promise<HashnodePost[]> {
	const batchSize = 50;
	const maxAttempts = 5;

	let allPosts: HashnodePost[] = [];
	let cursor: string | null = null;

	for (let attempt = 0; attempt < maxAttempts; attempt++) {
		const { posts, hasMore, endCursor } = await getPosts({
			limit: batchSize,
			after: cursor,
		});

		if (posts.length > 0) {
			allPosts = [...allPosts, ...posts];
		}

		if (!hasMore) break;
		cursor = endCursor;
	}

	return allPosts;
}
