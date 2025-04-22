// src/lib/hashnode.ts
import type {
	HashnodePost,
	GetPostsOptions,
	PostsResponse,
} from "@/types/hashnode";

const HASHNODE_ENDPOINT = "https://gql.hashnode.com";
const HASHNODE_HOST = "kafkaesque.hashnode.dev";

// Tracking used cursors to prevent duplicates
const usedCursors = new Set<string>();

const getHeaders = () => ({
	"Content-Type": "application/json",
	Authorization: `Bearer ${import.meta.env.HASHNODE_ACCESS_TOKEN}`,
});

export async function getPosts(
	options: GetPostsOptions = {}
): Promise<PostsResponse> {
	const { limit = 6, after = null } = options;

	// Check if we've already used this cursor to prevent cycles
	if (after && usedCursors.has(after)) {
		console.warn("Cursor already used:", after);
		return { posts: [], hasMore: false, endCursor: null };
	}

	// Track this cursor
	if (after) {
		usedCursors.add(after);
	}

	// Using edges-based pagination with cursor (Hashnode requires this specific pattern)
	const postsQuery = `
      query Publication($first: Int!, $after: String, $host: String!) {
        publication(host: $host) {
          posts(first: $first, after: $after) {
            edges {
              cursor
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
            pageInfo { hasNextPage endCursor }
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
			let errorBody = `(Status: ${response.status})`;
			try {
				errorBody = await response.text();
			} catch {
				/* ignore */
			}
			console.error(`Hashnode API request failed: ${errorBody}`);
			return { posts: [], hasMore: false, endCursor: null };
		}

		const json = await response.json();

		if (json.errors) {
			console.error(
				"Hashnode GraphQL Errors:",
				JSON.stringify(json.errors, null, 2)
			);
			return { posts: [], hasMore: false, endCursor: null };
		}

		const publicationData = json.data?.publication;
		if (!publicationData || !publicationData.posts) {
			console.error("Unexpected data structure received from Hashnode.");
			return { posts: [], hasMore: false, endCursor: null };
		}

		const edges = publicationData.posts.edges || [];
		const pageInfo = publicationData.posts.pageInfo;

		// IMPORTANT: Use the EDGE cursors instead of pageInfo.endCursor
		// This is critical for proper GraphQL cursor pagination with Hashnode
		const lastEdgeCursor =
			edges.length > 0 ? edges[edges.length - 1].cursor : null;

		// Map fields
		const posts: HashnodePost[] = edges.map((edge: any) => ({
			id: edge.node.id,
			slug: edge.node.slug,
			title: edge.node.title,
			subtitle: edge.node.subtitle || "",
			content: "",
			brief: "",
			coverImage: edge.node.coverImage?.url || null,
			publishedAt: edge.node.publishedAt,
			tags: edge.node.tags || [],
		}));

		// Fix the cursor issue by using the last edge's cursor instead of endCursor
		return {
			posts,
			hasMore: pageInfo?.hasNextPage && posts.length > 0,
			endCursor: lastEdgeCursor,
		};
	} catch (error) {
		console.error("Failed to fetch posts due to exception:", error);
		return { posts: [], hasMore: false, endCursor: null };
	}
}

// Keep these functions unchanged
export async function getPost(slug: string): Promise<HashnodePost | null> {
	// Existing implementation unchanged
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
			let errorBody = `(Status: ${response.status})`;
			try {
				errorBody = await response.text();
			} catch {
				/* ignore */
			}
			console.error(
				`Single post fetch failed for slug "${slug}": ${errorBody}`
			);
			return null;
		}
		const json = await response.json();
		if (json.errors) {
			console.error(
				`GraphQL Errors fetching single post "${slug}":`,
				JSON.stringify(json.errors, null, 2)
			);
			return null;
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
			coverImage: postData.coverImage?.url || null,
			publishedAt: postData.publishedAt,
			tags: postData.tags || [],
		};
	} catch (error) {
		console.error(
			`Failed to fetch post "${slug}" due to exception:`,
			error
		);
		return null;
	}
}

export async function getAllPosts(): Promise<HashnodePost[]> {
	// Existing implementation unchanged
	let allPosts: HashnodePost[] = [];
	let hasMore = true;
	let cursor: string | null = null;
	let fetchAttempts = 0;
	const maxAttempts = 15;
	const batchSize = 50;

	while (hasMore && fetchAttempts < maxAttempts) {
		fetchAttempts++;
		try {
			const {
				posts: batchPosts,
				hasMore: more,
				endCursor,
			} = await getPosts({ limit: batchSize, after: cursor });

			if (batchPosts.length > 0) {
				allPosts = [...allPosts, ...batchPosts];
			} else if (more) {
				console.warn(
					`getAllPosts: Received hasMore=true but no posts in batch ${fetchAttempts}. Stopping pagination early.`
				);
				hasMore = false;
				break;
			}
			hasMore = more;
			cursor = endCursor;
			if (!hasMore) break;
		} catch (error) {
			console.error(
				`getAllPosts: Error fetching batch ${fetchAttempts} (cursor: ${cursor}):`,
				error
			);
			hasMore = false;
		}
	}
	if (fetchAttempts >= maxAttempts && hasMore) {
		console.warn(
			`getAllPosts: Reached maximum fetch attempts (${maxAttempts}). Result may be incomplete.`
		);
	}
	return allPosts;
}
