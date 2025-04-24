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

	// console.log(`[hashnode.ts getPosts] Called with options:`, options);

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

		// console.log("--- Fetch Request Details (getPosts) ---");
		// console.log("Body:", requestBody);
		// console.log("---------------------------");

		// --- APPLY THE FIX HERE ---
		const response: Response = await fetch(HASHNODE_ENDPOINT, {
			method: "POST",
			headers: requestHeaders,
			body: requestBody,
			cache: "no-cache", // Prevent SvelteKit/Node fetch cache
		});
		// --- END FIX ---

		const responseText = await response.text();
		// console.log(`[hashnode.ts getPosts] Raw response status: ${response.status}`);

		if (!response.ok) {
			console.error(
				`[hashnode.ts getPosts] API request failed. Status: ${response.status}. Response text: ${responseText}`
			);
			throw new Error(`API request failed: ${response.status}`);
		}

		const json: any = JSON.parse(responseText);
		// console.log(`[hashnode.ts getPosts] Parsed JSON response:`, json);

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

		if (!response.ok) {
			/* ... error handling ... */ return null;
		}
		const json: any = await response.json();
		if (json.errors) {
			/* ... error handling ... */ return null;
		}
		const postData = json.data?.publication?.post;
		if (!postData) return null;
		// Map data...
		return {
			/* ... post object ... */
		} as HashnodePost; // Added type assertion for clarity
	} catch (error) {
		console.error(`[hashnode.ts] Failed to fetch post "${slug}":`, error);
		return null;
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
              edges { node { /* fields needed for search */ id title subtitle slug brief publishedAt coverImage { url } tags { name slug } } }
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
				/* ... error handling ... */ throw new Error(/* ... */);
			}
			const json: any = await response.json();
			if (json.errors) {
				/* ... error handling ... */ throw new Error(/* ... */);
			}

			const publicationData = json.data?.publication;
			if (!publicationData?.posts) {
				hasNext = false;
				break;
			}

			const edges = publicationData.posts.edges || [];
			const pageInfo = publicationData.posts.pageInfo || {};

			if (edges.length > 0) {
				const batchPosts: HashnodePost[] =
					edges.map(/* ... mapping ... */);
				allPosts = [...allPosts, ...batchPosts];
			}

			if (!pageInfo.hasNextPage) {
				hasNext = false;
			} else {
				cursor = pageInfo.endCursor;
				if (!cursor) {
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
		/* ... warning ... */
	}
	return allPosts;
}
