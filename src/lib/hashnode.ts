// src/lib/hashnode.ts
import type {
	HashnodePost,
	GetPostsOptions,
	PostsResponse,
} from "@/types/hashnode";

const HASHNODE_ENDPOINT = "https://gql.hashnode.com";

// Helper function to get headers, including the auth token
const getHeaders = () => ({
	"Content-Type": "application/json",
	Authorization: `Bearer ${import.meta.env.HASHNODE_ACCESS_TOKEN}`,
	// Add cache-control headers to try and force fresh data
	"Cache-Control": "no-cache, no-store, must-revalidate",
	Pragma: "no-cache", // For HTTP/1.0 caches
	Expires: "0", // Proxies
});

export async function getPosts(
	options: GetPostsOptions = {}
): Promise<PostsResponse> {
	const { limit = 6, after = null } = options; // Default values

	try {
		const postsQuery = `
      query Publication($first: Int!, $after: String) {
        publication(host: "kafkaesque.hashnode.dev") {
          # Note: Hashnode's API sorts by publishedAt DESC by default.
          # Explicit sorting isn't usually needed unless you want a different order.
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
                # Requesting HTML content here, ensure it's needed for the list view
                # If only brief is needed, removing 'content { html }' might speed things up
                content { html }
                tags { name slug }
              }
            }
            pageInfo { hasNextPage endCursor }
          }
        }
      }
    `;

		console.log(
			`Fetching posts from ${HASHNODE_ENDPOINT} for host kafkaesque.hashnode.dev with limit: ${limit}, after: ${after}`
		);

		const response = await fetch(HASHNODE_ENDPOINT, {
			method: "POST",
			headers: getHeaders(), // Use the helper function with cache headers
			body: JSON.stringify({
				query: postsQuery,
				variables: {
					first: limit,
					after: after,
				},
			}),
			// If using a framework like Next.js that extends fetch, uncomment below:
			// cache: 'no-store',
		});

		console.log(`Fetch response status: ${response.status}`);

		if (!response.ok) {
			// Attempt to read error body for more context
			let errorBody = "Could not read error body";
			try {
				errorBody = await response.text();
			} catch (e) {
				console.error("Error reading response body:", e);
			}
			console.error(
				`Hashnode API request failed with status ${response.status}: ${errorBody}`
			);
			// Return empty state on failure
			return { posts: [], hasMore: false, endCursor: null };
		}

		const json = await response.json();

		// Check for GraphQL specific errors in the response body
		if (json.errors) {
			console.error(
				"Hashnode GraphQL Errors:",
				JSON.stringify(json.errors, null, 2)
			);
			return { posts: [], hasMore: false, endCursor: null };
		}

		// Validate the expected data structure
		const publicationData = json.data?.publication;
		if (!publicationData || !publicationData.posts) {
			console.error(
				"Unexpected data structure received from Hashnode:",
				JSON.stringify(json.data, null, 2)
			);
			return { posts: [], hasMore: false, endCursor: null };
		}

		const edges = publicationData.posts.edges || [];
		const pageInfo = publicationData.posts.pageInfo;

		// Map edges to Post objects with safer access to nested properties
		const posts: HashnodePost[] = edges.map((edge: any) => ({
			id: edge.node.id,
			slug: edge.node.slug,
			title: edge.node.title,
			subtitle: edge.node.subtitle || "",
			// Ensure content and html exist before accessing
			content: edge.node.content?.html || "",
			brief: edge.node.brief || "", // Add default for brief
			coverImage: edge.node.coverImage?.url || null,
			publishedAt: edge.node.publishedAt,
			// Ensure tags exist and provide default empty array
			tags: edge.node.tags || [],
		}));

		if (posts.length > 0) {
			console.log(
				`Successfully fetched ${posts.length} posts. First post title: "${posts[0].title}"`
			);
		} else {
			console.log(
				`Successfully fetched 0 posts. (Host: kafkaesque.hashnode.dev, After: ${after})`
			);
		}

		return {
			posts,
			hasMore: pageInfo?.hasNextPage || false,
			endCursor: pageInfo?.endCursor || null,
		};
	} catch (error) {
		// Catch network errors or other exceptions during fetch/processing
		console.error("Failed to fetch posts due to exception:", error);
		return { posts: [], hasMore: false, endCursor: null };
	}
}

// --- getPost and getAllPosts remain the same, but could also benefit ---
// --- from similar cache headers and logging if needed. ---

export async function getPost(slug: string): Promise<HashnodePost | null> {
	try {
		const query = `
      query GetPostBySlug($slug: String!) {
        publication(host: "kafkaesque.hashnode.dev") {
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
		console.log(`Fetching single post with slug: ${slug}`);
		const response = await fetch(HASHNODE_ENDPOINT, {
			method: "POST",
			headers: getHeaders(), // Use cache headers here too
			body: JSON.stringify({ query: query, variables: { slug: slug } }),
			// cache: 'no-store', // If needed
		});

		console.log(`Fetch single post response status: ${response.status}`);

		if (!response.ok) {
			const errorBody = await response.text();
			console.error(
				`Single post fetch failed (${response.status}): ${errorBody}`
			);
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
			console.log(`Post with slug "${slug}" not found.`);
			return null;
		}

		console.log(`Successfully fetched post: "${post.title}"`);
		return {
			id: post.id,
			slug, // Slug is passed in, reuse it
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

// getAllPosts uses getPosts internally, so it benefits from the changes there.
// No direct changes needed here unless you want specific logging for the loop.
export async function getAllPosts(): Promise<HashnodePost[]> {
	let allPosts: HashnodePost[] = [];
	let hasMore = true;
	let cursor: string | null = null;
	let page = 1; // For logging

	console.log("Starting to fetch all posts...");

	while (hasMore) {
		console.log(`Fetching page ${page} of all posts (cursor: ${cursor})`);
		try {
			const {
				posts,
				hasMore: more,
				endCursor,
			} = await getPosts({ limit: 50, after: cursor }); // Using updated getPosts

			if (posts.length > 0) {
				allPosts = [...allPosts, ...posts];
				console.log(
					`Fetched ${posts.length} posts on page ${page}. Total now: ${allPosts.length}`
				);
			} else {
				console.log(`Fetched 0 posts on page ${page}.`);
			}

			hasMore = more;
			cursor = endCursor;
			page++;

			if (!hasMore) {
				console.log("No more pages to fetch.");
			}
		} catch (error) {
			console.error(`Error fetching page ${page} in getAllPosts:`, error);
			// Decide if you want to break the loop or retry on error
			hasMore = false; // Stop fetching on error
		}
	}

	console.log(`Finished fetching all posts. Total: ${allPosts.length}`);
	return allPosts;
}
