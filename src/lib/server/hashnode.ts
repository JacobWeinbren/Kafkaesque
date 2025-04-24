// src/lib/server/hashnode.ts

// --- Use dotenv directly ---
import dotenv from "dotenv";
dotenv.config(); // Load variables from .env into process.env

// Access variables via process.env
const HASHNODE_ACCESS_TOKEN = process.env["HASHNODE_ACCESS_TOKEN"];
const HASHNODE_HOST = process.env["HASHNODE_HOST"];
// --- End dotenv usage ---

// --- Core Types ---
interface HashnodeTag {
	name: string;
	slug: string;
}
export interface HashnodePost {
	id: string;
	slug: string;
	title: string;
	subtitle: string;
	content: string; // For full post
	brief: string; // For summaries/all posts
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
const getHeaders = (): HeadersInit => {
	const token = HASHNODE_ACCESS_TOKEN;
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
		"User-Agent": "curl/7.88.1", // Keep this for consistency for now
	};
	if (token) {
		// Keep logs for debugging if needed, remove later if desired
		// console.log("[hashnode.ts getHeaders] Using Authorization token.");
		headers["Authorization"] = `Bearer ${token}`;
	} else {
		console.warn(
			"[hashnode.ts getHeaders] HASHNODE_ACCESS_TOKEN not set. No Authorization header sent."
		);
	}
	return headers;
};
// --- End getHeaders ---

// --- API Functions ---

/**
 * Fetches a batch of posts (summaries) from Hashnode.
 * Returns original image URLs.
 * NOTE: Default Hashnode sort order is used. Explicit sorting seems unsupported here.
 */
export async function getPosts(
	options: GetPostsOptions = {}
): Promise<OriginalPostsResponse> {
	const { limit = 6, after = null } = options;

	// --- REVERTED QUERY: No sorting argument ---
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
	// --- END QUERY REVERSION ---

	console.log(`[hashnode.ts getPosts] Called with options:`, options);
	// console.log(`[hashnode.ts getPosts] Using host: ${HASHNODE_HOST}`);

	try {
		if (typeof HASHNODE_HOST === "undefined" || !HASHNODE_HOST) {
			console.error(
				"[hashnode.ts] getPosts: HASHNODE_HOST is missing or empty in .env!"
			);
			throw new Error(
				"HASHNODE_HOST environment variable is not configured correctly."
			);
		}

		// --- REVERTED VARIABLES: No sorting variable ---
		const variables = {
			first: limit,
			after,
			host: HASHNODE_HOST,
		};
		// --- END VARIABLES REVERSION ---

		const requestBody = JSON.stringify({
			query: postsQuery,
			variables: variables,
		});
		const requestHeaders = getHeaders();

		// Keep detailed logs temporarily if still debugging the order difference
		console.log("--- Fetch Request Details (getPosts - Reverted) ---");
		console.log("Body:", requestBody);
		// console.log("---------------------------");

		const response: Response = await fetch(HASHNODE_ENDPOINT, {
			method: "POST",
			headers: requestHeaders,
			body: requestBody,
		});

		const responseText = await response.text();
		// console.log(`[hashnode.ts getPosts] Raw response status: ${response.status}`);

		if (!response.ok) {
			console.error(
				`[hashnode.ts getPosts] API request failed. Response text: ${responseText}`
			);
			throw new Error(`API request failed: ${response.status}`);
		}

		const json: any = JSON.parse(responseText);
		console.log(
			`[hashnode.ts getPosts] Parsed JSON response:`,
			JSON.stringify(json, null, 2)
		);

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
 * (No changes needed here)
 */
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
		if (typeof HASHNODE_HOST === "undefined" || !HASHNODE_HOST) {
			console.error(
				"[hashnode.ts] getPost: HASHNODE_HOST is missing or empty in .env!"
			);
			return null;
		}
		const variables = { slug, host: HASHNODE_HOST };
		const response: Response = await fetch(HASHNODE_ENDPOINT, {
			method: "POST",
			headers: getHeaders(),
			body: JSON.stringify({ query: query, variables: variables }),
		});
		if (!response.ok) {
			const errorBody = await response
				.text()
				.catch(() => "Could not read error body");
			console.error(
				`[hashnode.ts] getPost: API request failed fetching post ${slug}: ${response.status} ${response.statusText}. Variables sent: ${JSON.stringify(variables)}. Body: ${errorBody}`
			);
			return null;
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
			if (
				json.errors.some((e: any) =>
					e.message?.toLowerCase().includes("not found")
				)
			) {
				return null;
			}
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
		return null;
	}
}

/**
 * Fetches ALL post summaries from Hashnode for search index.
 * NOTE: Default Hashnode sort order is used. Explicit sorting seems unsupported here.
 */
export async function getAllPosts(): Promise<HashnodePost[]> {
	const batchSize = 50;
	const maxAttempts = 20;
	let allPosts: HashnodePost[] = [];
	let cursor: string | null = null;
	let hasNext = true;
	let attempts = 0;

	// --- REVERTED QUERY: No sorting argument ---
	const allPostsQuery = `
        query PublicationAllPosts($first: Int!, $after: String, $host: String!) {
          publication(host: $host) {
            posts(first: $first, after: $after) { # No sortBy or PostSortBy here
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
	// --- END QUERY REVERSION ---

	if (typeof HASHNODE_HOST === "undefined" || !HASHNODE_HOST) {
		console.error(
			"[hashnode.ts] getAllPosts: HASHNODE_HOST is missing or empty in .env!"
		);
		return [];
	}

	while (hasNext && attempts < maxAttempts) {
		attempts++;
		// --- REVERTED VARIABLES: No sorting variable ---
		const variables = {
			first: batchSize,
			after: cursor,
			host: HASHNODE_HOST,
		};
		// --- END VARIABLES REVERSION ---

		try {
			const requestBody = JSON.stringify({
				query: allPostsQuery,
				variables: variables,
			});
			const requestHeaders = getHeaders();

			const response: Response = await fetch(HASHNODE_ENDPOINT, {
				method: "POST",
				headers: requestHeaders,
				body: requestBody,
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
			hasNext = false;
			break;
		}
	}

	if (hasNext && attempts >= maxAttempts) {
		console.warn(
			`getAllPosts: Reached max attempts limit (${maxAttempts}) before fetching all posts.`
		);
	}

	return allPosts;
}
