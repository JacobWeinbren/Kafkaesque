// src/lib/server/hashnode.ts

// --- Use dotenv directly ---
import dotenv from "dotenv";
dotenv.config(); // Load variables from .env into process.env

// Access variables via process.env
const HASHNODE_ACCESS_TOKEN = process.env["HASHNODE_ACCESS_TOKEN"];
const HASHNODE_HOST = process.env["HASHNODE_HOST"];
// --- End dotenv usage ---

// --- Core Types --- (Keep existing types)
interface HashnodeTag {
	name: string;
	slug: string;
}
export interface HashnodePost {
	id: string;
	slug: string;
	title: string;
	subtitle: string;
	content: string;
	brief: string;
	coverImage: { src: string } | null;
	publishedAt: string;
	tags: HashnodeTag[];
}
export interface GetPostsOptions {
	limit?: number;
	after?: string | null;
}
export interface OriginalPostsResponse {
	posts: HashnodePost[];
	hasMore: boolean;
	endCursor: string | null;
}

// --- Hashnode API Configuration ---
const HASHNODE_ENDPOINT = "https://gql.hashnode.com";

// --- getHeaders function ---
// Returns a type compatible with HeadersInit for fetch
const getHeaders = (): HeadersInit => {
	const token = HASHNODE_ACCESS_TOKEN; // Uses variable loaded via dotenv
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
	};
	if (token) {
		headers["Authorization"] = `Bearer ${token}`;
	} else {
		// This warning should appear in your server logs if the token is missing
		console.warn(
			"HASHNODE_ACCESS_TOKEN environment variable is not set. API calls might be rate-limited or fail."
		);
	}
	return headers;
};
// --- End getHeaders ---

// --- API Functions ---

/**
 * Fetches a batch of posts (summaries) from Hashnode.
 * Returns original image URLs.
 */
export async function getPosts(
	options: GetPostsOptions = {}
): Promise<OriginalPostsResponse> {
	const { limit = 6, after = null } = options;
	// Keep your actual query here
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
		// Check if HASHNODE_HOST was loaded correctly via dotenv
		if (typeof HASHNODE_HOST === "undefined" || !HASHNODE_HOST) {
			console.error(
				"[hashnode.ts] getPosts: HASHNODE_HOST is missing or empty in .env!"
			);
			throw new Error(
				"HASHNODE_HOST environment variable is not configured correctly."
			);
		}

		const variables = { first: limit, after, host: HASHNODE_HOST };
		console.log(
			`[hashnode.ts] getPosts: Attempting fetch with variables: ${JSON.stringify(variables)}`
		);

		const response: Response = await fetch(HASHNODE_ENDPOINT, {
			method: "POST",
			headers: getHeaders(),
			body: JSON.stringify({
				query: postsQuery,
				variables: variables,
			}),
		});

		if (!response.ok) {
			const errorBody = await response
				.text()
				.catch(() => "Could not read error body");
			console.error(
				`[hashnode.ts] getPosts: API request failed: ${response.status} ${response.statusText}. Variables sent: ${JSON.stringify(variables)}. Body: ${errorBody}`
			);
			throw new Error(`API request failed: ${response.status}`);
		}

		const json: any = await response.json();

		if (json.errors) {
			console.error(
				"[hashnode.ts] getPosts: GraphQL Errors:",
				JSON.stringify(json.errors, null, 2)
			);
			console.error(
				`[hashnode.ts] getPosts: Variables sent during GraphQL error: ${JSON.stringify(variables)}`
			);
			throw new Error(
				`GraphQL errors occurred fetching posts. Check server logs.`
			);
		}

		const publicationData = json.data?.publication;
		if (!publicationData?.posts) {
			console.warn(
				"[hashnode.ts] No posts found in publication data for host:",
				HASHNODE_HOST
			);
			return { posts: [], hasMore: false, endCursor: null };
		}

		const edges = publicationData.posts.edges || [];
		const pageInfo = publicationData.posts.pageInfo || {};

		const posts: HashnodePost[] = edges.map(
			(edge: any): HashnodePost => ({
				id: edge.node.id,
				slug: edge.node.slug,
				title: edge.node.title,
				subtitle: edge.node.subtitle || "",
				content: "",
				brief: "",
				coverImage: edge.node.coverImage?.url
					? { src: edge.node.coverImage.url }
					: null,
				publishedAt: edge.node.publishedAt,
				tags: [],
			})
		);

		return {
			posts,
			hasMore: !!pageInfo.hasNextPage && posts.length > 0,
			endCursor: pageInfo.endCursor,
		};
	} catch (error: any) {
		console.error(
			"[hashnode.ts] Failed to fetch posts (outer catch):",
			error
		);
		throw new Error(error.message || "Failed to fetch posts from source.");
	}
}

/**
 * Fetches a single full post by slug from Hashnode.
 */
export async function getPost(slug: string): Promise<HashnodePost | null> {
	// Keep your actual query here
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
		// Check if HASHNODE_HOST was loaded correctly via dotenv
		if (typeof HASHNODE_HOST === "undefined" || !HASHNODE_HOST) {
			console.error(
				"[hashnode.ts] getPost: HASHNODE_HOST is missing or empty in .env!"
			);
			return null; // Return null if config is missing
		}

		const variables = { slug, host: HASHNODE_HOST };
		console.log(
			`[hashnode.ts] getPost: Attempting fetch with variables: ${JSON.stringify(variables)}`
		);

		const response: Response = await fetch(HASHNODE_ENDPOINT, {
			method: "POST",
			headers: getHeaders(),
			body: JSON.stringify({
				query: query,
				variables: variables,
			}),
		});

		if (!response.ok) {
			const errorBody = await response
				.text()
				.catch(() => "Could not read error body");
			console.error(
				`[hashnode.ts] getPost: API request failed fetching post ${slug}: ${response.status} ${response.statusText}. Variables sent: ${JSON.stringify(variables)}. Body: ${errorBody}`
			);
			return null; // Return null on fetch failure
		}

		const json: any = await response.json();

		if (json.errors) {
			console.error(
				`[hashnode.ts] getPost: GraphQL Errors for slug ${slug}:`,
				JSON.stringify(json.errors, null, 2)
			);
			console.error(
				`[hashnode.ts] getPost: Variables sent during GraphQL error: ${JSON.stringify(variables)}`
			);
			// Check for specific 'not found' errors if Hashnode provides them
			if (
				json.errors.some((e: any) =>
					e.message?.toLowerCase().includes("not found")
				)
			) {
				return null; // Treat as not found
			}
			return null; // Return null on other GraphQL errors
		}

		const postData = json.data?.publication?.post;

		if (!postData) {
			return null; // Post not found
		}

		return {
			id: postData.id,
			slug,
			title: postData.title,
			subtitle: postData.subtitle || "",
			content: postData.content?.html || "",
			brief: postData.brief || "",
			coverImage: postData.coverImage?.url
				? { src: postData.coverImage.url }
				: null,
			publishedAt: postData.publishedAt,
			tags: postData.tags || [],
		};
	} catch (error) {
		console.error(
			`[hashnode.ts] Failed to fetch post "${slug}" (outer catch):`,
			error
		);
		return null; // Return null on unexpected fetch errors
	}
}

/**
 * Fetches ALL post summaries from Hashnode for search index.
 */
export async function getAllPosts(): Promise<HashnodePost[]> {
	const batchSize = 50;
	const maxAttempts = 20;
	let allPosts: HashnodePost[] = [];
	let cursor: string | null = null;
	let hasNext = true;
	let attempts = 0;

	// Keep your actual query here
	const allPostsQuery = `
        query PublicationAllPosts($first: Int!, $after: String, $host: String!) {
          publication(host: $host) {
            posts(first: $first, after: $after) {
              edges {
                node {
                  id
                  title
                  subtitle
                  slug
                  brief
                  publishedAt
                  coverImage { url }
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

	console.log("getAllPosts: Starting fetch loop...");

	// Check if HASHNODE_HOST was loaded correctly via dotenv
	if (typeof HASHNODE_HOST === "undefined" || !HASHNODE_HOST) {
		console.error(
			"[hashnode.ts] getAllPosts: HASHNODE_HOST is missing or empty in .env!"
		);
		return []; // Return empty if config is missing
	}

	while (hasNext && attempts < maxAttempts) {
		attempts++;
		const variables = {
			first: batchSize,
			after: cursor,
			host: HASHNODE_HOST,
		};
		console.log(
			`getAllPosts: Attempt ${attempts}, variables: ${JSON.stringify(variables)}`
		);

		try {
			const response: Response = await fetch(HASHNODE_ENDPOINT, {
				method: "POST",
				headers: getHeaders(),
				body: JSON.stringify({
					query: allPostsQuery,
					variables: variables,
				}),
			});

			if (!response.ok) {
				const errorBody = await response
					.text()
					.catch(() => "Could not read error body");
				console.error(
					`getAllPosts: API request failed attempt ${attempts}: ${response.status} ${response.statusText}. Variables sent: ${JSON.stringify(variables)}. Body: ${errorBody}`
				);
				throw new Error(
					`API request failed: ${response.status} ${response.statusText}`
				);
			}
			const json: any = await response.json();

			if (json.errors) {
				console.error(
					`GraphQL Errors (getAllPosts attempt ${attempts}):`,
					JSON.stringify(json.errors, null, 2)
				);
				console.error(
					`getAllPosts: Variables sent during GraphQL error: ${JSON.stringify(variables)}`
				);
				throw new Error(`GraphQL errors occurred during getAllPosts.`);
			}

			const publicationData = json.data?.publication;
			if (!publicationData?.posts) {
				console.warn(
					`getAllPosts: No posts data found in attempt ${attempts}.`
				);
				hasNext = false;
				break;
			}

			const edges = publicationData.posts.edges || [];
			const pageInfo = publicationData.posts.pageInfo || {};

			console.log(
				`getAllPosts: Fetched ${edges.length} posts in batch ${attempts}. HasMore: ${pageInfo.hasNextPage}`
			);

			if (edges.length > 0) {
				const batchPosts: HashnodePost[] = edges.map(
					(edge: any): HashnodePost => ({
						id: edge.node.id,
						slug: edge.node.slug,
						title: edge.node.title,
						subtitle: edge.node.subtitle || "",
						content: "",
						brief: edge.node.brief || "",
						coverImage: edge.node.coverImage?.url
							? { src: edge.node.coverImage.url }
							: null,
						publishedAt: edge.node.publishedAt,
						tags: edge.node.tags || [],
					})
				);
				allPosts = [...allPosts, ...batchPosts];
			}

			if (!pageInfo.hasNextPage) {
				hasNext = false;
			} else {
				cursor = pageInfo.endCursor;
				if (!cursor) {
					console.warn(
						"getAllPosts: HasMore is true but endCursor is null. Breaking loop."
					);
					hasNext = false;
				}
			}

			if (hasNext)
				await new Promise((resolve) => setTimeout(resolve, 200));
		} catch (error) {
			console.error(
				`getAllPosts: Error during fetch attempt ${attempts}:`,
				error
			);
			hasNext = false; // Stop fetching on error
			break;
		}
	} // End while loop

	if (hasNext && attempts >= maxAttempts) {
		console.warn(
			`getAllPosts: Reached max attempts limit (${maxAttempts}) before fetching all posts.`
		);
	}

	console.log(
		`getAllPosts: Finished fetch loop. Total posts fetched: ${allPosts.length}`
	);
	return allPosts;
}
