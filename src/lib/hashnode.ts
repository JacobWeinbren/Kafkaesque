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

// Track previously seen cursors to detect loops
const seenCursors = new Set<string>();

// Fetch a list of posts
export async function getPosts(
	options: GetPostsOptions = {}
): Promise<PostsResponse> {
	const { limit = 6, after = null } = options;

	// Standard cursor-based pagination query with page info
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
		console.log(`Hashnode query with cursor: ${after || "null"}`);

		// Check if we've seen this cursor before - avoid infinite loops
		if (after && seenCursors.has(after)) {
			console.warn(`Cursor loop detected: ${after}`);
			return { posts: [], hasMore: false, endCursor: null };
		}

		// Add current cursor to seen set
		if (after) {
			seenCursors.add(after);
		}

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
		const pageInfo = publicationData.posts.pageInfo || {};

		console.log(
			`Raw API response - edges: ${edges.length}, hasNextPage: ${
				pageInfo.hasNextPage
			}, endCursor: ${pageInfo.endCursor || "null"}`
		);

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

		// CRITICAL FIX: Multiple checks to detect pagination issues
		const sameAsPreviousCursor = after && after === pageInfo.endCursor;
		const emptyButClaimsMore = posts.length === 0 && pageInfo.hasNextPage;
		const cursorButNoNext = after && !pageInfo.hasNextPage;

		// If any issues detected, stop pagination
		const hasMore =
			pageInfo.hasNextPage &&
			!sameAsPreviousCursor &&
			!emptyButClaimsMore &&
			posts.length > 0;

		// Only use the endCursor if we actually have more posts
		const endCursor = hasMore ? pageInfo.endCursor : null;

		console.log(
			`Processed - posts: ${
				posts.length
			}, hasMore: ${hasMore}, endCursor: ${endCursor || "null"}, ` +
				`sameAsPrevious: ${sameAsPreviousCursor}, emptyButClaimsMore: ${emptyButClaimsMore}, cursorButNoNext: ${cursorButNoNext}`
		);

		// For debugging: Log post IDs to check for duplicates
		if (posts.length > 0) {
			console.log(
				`Post IDs in this batch: ${posts.map((p) => p.id).join(", ")}`
			);
		}

		return {
			posts,
			hasMore,
			endCursor,
		};
	} catch (error) {
		console.error("Failed to fetch posts due to exception:", error);
		return { posts: [], hasMore: false, endCursor: null };
	}
}

// Reset seen cursors (useful for testing/debugging)
export function resetCursorTracking() {
	seenCursors.clear();
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
	// Reset cursor tracking to avoid false positives in bulk fetching
	resetCursorTracking();

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
