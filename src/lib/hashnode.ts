// src/lib/hashnode.ts
import type {
	HashnodePost,
	GetPostsOptions,
	PostsResponse,
} from "@/types/hashnode";

const HASHNODE_ENDPOINT = "https://gql.hashnode.com";

// Helper function to get headers, including the auth token and cache control
const getHeaders = () => ({
	"Content-Type": "application/json",
	Authorization: `Bearer ${import.meta.env.HASHNODE_ACCESS_TOKEN}`,
	// Keep cache-control headers as they might help, even if not fully solving the Vercel issue
	"Cache-Control": "no-cache, no-store, must-revalidate",
	Pragma: "no-cache",
	Expires: "0",
});

export async function getPosts(
	options: GetPostsOptions = {}
): Promise<PostsResponse> {
	const { limit = 6, after = null } = options;

	try {
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
                brief
                slug
                coverImage { url }
                publishedAt
                content { html } # Keep if needed for list/preview
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
					first: limit,
					after: after,
					host: "kafkaesque.hashnode.dev", // Hardcoded host
				},
			}),
			// cache: 'no-store', // Consider if using Next.js/Vercel fetch extensions
		});

		if (!response.ok) {
			// Log failure status and attempt to log body for context
			let errorBody = `(Status: ${response.status})`;
			try {
				errorBody = await response.text();
			} catch {
				/* ignore error reading body */
			}
			console.error(`Hashnode API request failed: ${errorBody}`);
			return { posts: [], hasMore: false, endCursor: null };
		}

		const json = await response.json();

		if (json.errors) {
			// Log GraphQL specific errors returned by Hashnode
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

		const posts: HashnodePost[] = edges.map((edge: any) => ({
			id: edge.node.id,
			slug: edge.node.slug,
			title: edge.node.title,
			subtitle: edge.node.subtitle || "",
			content: edge.node.content?.html || "",
			brief: edge.node.brief || "",
			coverImage: edge.node.coverImage?.url || null,
			publishedAt: edge.node.publishedAt,
			tags: edge.node.tags || [],
		}));

		return {
			posts,
			hasMore: pageInfo?.hasNextPage || false,
			endCursor: pageInfo?.endCursor || null,
		};
	} catch (error) {
		// Catch network errors or other exceptions
		console.error("Failed to fetch posts due to exception:", error);
		return { posts: [], hasMore: false, endCursor: null };
	}
}

export async function getPost(slug: string): Promise<HashnodePost | null> {
	try {
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

		const response = await fetch(HASHNODE_ENDPOINT, {
			method: "POST",
			headers: getHeaders(),
			body: JSON.stringify({
				query: query,
				variables: {
					slug: slug,
					host: "kafkaesque.hashnode.dev", // Hardcoded host
				},
			}),
			// cache: 'no-store', // If needed
		});

		if (!response.ok) {
			let errorBody = `(Status: ${response.status})`;
			try {
				errorBody = await response.text();
			} catch {
				/* ignore */
			}
			console.error(`Single post fetch failed: ${errorBody}`);
			return null;
		}

		const json = await response.json();
		if (json.errors) {
			console.error(
				"GraphQL Errors fetching single post:",
				JSON.stringify(json.errors, null, 2)
			);
			return null;
		}

		const post = json.data?.publication?.post;
		if (!post) {
			// Not necessarily an error, post might just not exist
			return null;
		}

		return {
			id: post.id,
			slug,
			title: post.title,
			subtitle: post.subtitle || "",
			content: post.content?.html || "",
			brief: post.brief || "",
			coverImage: post.coverImage?.url || null,
			publishedAt: post.publishedAt,
			tags: post.tags || [],
		};
	} catch (error) {
		console.error(`Failed to fetch post "${slug}":`, error);
		return null;
	}
}

export async function getAllPosts(): Promise<HashnodePost[]> {
	let allPosts: HashnodePost[] = [];
	let hasMore = true;
	let cursor: string | null = null;

	while (hasMore) {
		try {
			// getPosts internally handles its own errors/logging
			const {
				posts,
				hasMore: more,
				endCursor,
			} = await getPosts({ limit: 50, after: cursor }); // Fetch large batches

			if (posts.length > 0) {
				allPosts = [...allPosts, ...posts];
			}

			hasMore = more;
			cursor = endCursor;

			if (!hasMore) {
				break; // Exit loop cleanly
			}
		} catch (error) {
			// Log error specific to the getAllPosts loop iteration
			console.error(
				`Error fetching batch in getAllPosts (cursor: ${cursor}):`,
				error
			);
			hasMore = false; // Stop fetching on error to prevent infinite loops
		}
	}
	return allPosts;
}
