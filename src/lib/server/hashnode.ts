// src/lib/server/hashnode.ts

import dotenv from "dotenv";
dotenv.config(); // Load variables from .env into process.env

const HASHNODE_ACCESS_TOKEN = process.env["HASHNODE_ACCESS_TOKEN"];
const HASHNODE_HOST = process.env["HASHNODE_HOST"];

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
	publishedAt: string; // Should be a valid date string or empty string
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

// --- getHeaders function (no changes needed) ---
const getHeaders = (): HeadersInit => {
	const token = HASHNODE_ACCESS_TOKEN;
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
		"User-Agent": "curl/7.88.1", // Or your app's user agent
	};
	if (token) {
		headers["Authorization"] = `Bearer ${token}`;
	} else {
		// console.warn("[hashnode.ts getHeaders] HASHNODE_ACCESS_TOKEN not set.");
	}
	return headers;
};

// --- API Functions ---

/**
 * Fetches a batch of posts (summaries) from Hashnode.
 * Returns original image URLs.
 * Uses default Hashnode sort order.
 */
export async function getPosts(
	options: GetPostsOptions = {}
): Promise<OriginalPostsResponse> {
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
		if (typeof HASHNODE_HOST === "undefined" || !HASHNODE_HOST) {
			throw new Error(
				"HASHNODE_HOST environment variable is not configured correctly."
			);
		}

		const variables = {
			first: limit,
			after,
			host: HASHNODE_HOST,
		};

		const requestBody = JSON.stringify({
			query: postsQuery,
			variables: variables,
		});
		const requestHeaders = getHeaders();

		const response: Response = await fetch(HASHNODE_ENDPOINT, {
			method: "POST",
			headers: requestHeaders,
			body: requestBody,
			cache: "no-cache", // Prevent SvelteKit/Node fetch cache
		});

		const responseText = await response.text();

		if (!response.ok) {
			console.error(
				`[hashnode.ts getPosts] API request failed. Status: ${response.status}. Response text: ${responseText}`
			);
			throw new Error(`API request failed: ${response.status}`);
		}

		const json: any = JSON.parse(responseText);

		if (json.errors) {
			console.error(
				"[hashnode.ts] getPosts: GraphQL Errors:",
				json.errors
			);
			throw new Error(`GraphQL errors occurred fetching posts.`);
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
				title: edge.node.title || "Untitled", // Fallback
				subtitle: edge.node.subtitle || "",
				content: "", // Not fetched in this query
				brief: "", // Not fetched in this query
				coverImage: edge.node.coverImage?.url
					? { src: edge.node.coverImage.url }
					: null,
				publishedAt: edge.node.publishedAt || "", // Fallback
				tags: [], // Not fetched in this query
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
			console.error("[hashnode.ts] getPost: HASHNODE_HOST is missing!");
			return null;
		}
		const variables = { slug, host: HASHNODE_HOST };

		// --- APPLY THE FIX HERE ---
		const response: Response = await fetch(HASHNODE_ENDPOINT, {
			method: "POST",
			headers: getHeaders(),
			body: JSON.stringify({ query: query, variables: variables }),
			cache: "no-cache", // Prevent SvelteKit/Node fetch cache
		});
		// --- END FIX ---

		// Check response.ok FIRST
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

		// Check for GraphQL errors AFTER parsing JSON
		if (json.errors) {
			console.error(
				`[hashnode.ts] getPost: GraphQL Errors for slug ${slug}:`,
				JSON.stringify(json.errors, null, 2)
			);
			// Check if it's specifically a "not found" error
			if (
				json.errors.some((e: any) =>
					e.message?.toLowerCase().includes("not found")
				)
			) {
				return null; // Return null if Hashnode explicitly says not found
			}
			// For other GraphQL errors, maybe still return null or throw
			return null;
		}

		const postData = json.data?.publication?.post;
		if (!postData) {
			console.warn(
				`[hashnode.ts] getPost: No post data found in response for slug ${slug}`
			);
			return null; // Return null if post data structure is missing
		}

		// Map data carefully
		return {
			id: postData.id,
			slug, // slug comes from input param
			title: postData.title || "Untitled", // Add fallback
			subtitle: postData.subtitle || "",
			// Ensure content is always a string, default to empty
			content: postData.content?.html || "",
			brief: postData.brief || "",
			coverImage: postData.coverImage?.url
				? { src: postData.coverImage.url }
				: null,
			// IMPORTANT: Check publishedAt exists before assigning
			publishedAt: postData.publishedAt || "", // Default to empty string if null/undefined
			tags: postData.tags || [],
		};
	} catch (error) {
		console.error(
			`[hashnode.ts] Failed to fetch post "${slug}" (outer catch):`,
			error
		);
		return null; // Return null on any unexpected error
	}
}

/**
 * Fetches ALL post summaries from Hashnode for search index.
 * Uses default Hashnode sort order.
 */
export async function getAllPosts(): Promise<HashnodePost[]> {
	const batchSize = 50;
	const maxAttempts = 20;
	let allPosts: HashnodePost[] = [];
	let cursor: string | null = null;
	let hasNext = true;
	let attempts = 0;

	const allPostsQuery = `
        query PublicationAllPosts($first: Int!, $after: String, $host: String!) {
          publication(host: $host) {
            posts(first: $first, after: $after) {
              edges { node { id title subtitle slug brief publishedAt coverImage { url } tags { name slug } } }
              pageInfo { hasNextPage endCursor }
            }
          }
        }
      `;

	if (typeof HASHNODE_HOST === "undefined" || !HASHNODE_HOST) {
		console.error("[hashnode.ts] getAllPosts: HASHNODE_HOST is missing!");
		return [];
	}

	while (hasNext && attempts < maxAttempts) {
		attempts++;
		const variables = {
			first: batchSize,
			after: cursor,
			host: HASHNODE_HOST,
		};

		try {
			const requestBody = JSON.stringify({
				query: allPostsQuery,
				variables: variables,
			});
			const requestHeaders = getHeaders();

			// --- APPLY THE FIX HERE ---
			const response: Response = await fetch(HASHNODE_ENDPOINT, {
				method: "POST",
				headers: requestHeaders,
				body: requestBody,
				cache: "no-cache", // Prevent SvelteKit/Node fetch cache
			});
			// --- END FIX ---

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
						title: edge.node.title || "Untitled",
						subtitle: edge.node.subtitle || "",
						content: "", // Not fetched here
						brief: edge.node.brief || "",
						coverImage: edge.node.coverImage?.url
							? { src: edge.node.coverImage.url }
							: null,
						publishedAt: edge.node.publishedAt || "",
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
				await new Promise((resolve) => setTimeout(resolve, 200)); // Rate limiting
		} catch (error) {
			console.error(
				`getAllPosts: Error during fetch attempt ${attempts}:`,
				error
			);
			hasNext = false; // Stop fetching on error
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
