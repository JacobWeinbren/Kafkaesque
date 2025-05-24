import dotenv from "dotenv";
dotenv.config();

const HASHNODE_ACCESS_TOKEN = process.env.HASHNODE_ACCESS_TOKEN;
const HASHNODE_HOST = process.env.HASHNODE_HOST;

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

interface GraphQLResponse {
	data?: {
		publication?: {
			posts?: {
				edges?: Array<{
					node: {
						id: string;
						title: string;
						subtitle: string;
						slug: string;
						coverImage?: { url: string };
						publishedAt: string;
						content?: { html: string };
						brief: string;
						tags: HashnodeTag[];
					};
				}>;
				pageInfo: {
					hasNextPage: boolean;
					endCursor: string | null;
				};
			};
			post?: {
				id: string;
				title: string;
				subtitle: string;
				content?: { html: string };
				brief: string;
				coverImage?: { url: string };
				publishedAt: string;
				tags: HashnodeTag[];
			};
		};
	};
	errors?: Array<{ message: string }>;
}

const HASHNODE_ENDPOINT = "https://gql.hashnode.com";

const getHeaders = (): HeadersInit => {
	const token = HASHNODE_ACCESS_TOKEN;
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
		"User-Agent": "curl/7.88.1",
	};
	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}
	return headers;
};

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

		const response: Response = await fetch(HASHNODE_ENDPOINT, {
			method: "POST",
			headers: getHeaders(),
			body: JSON.stringify({
				query: postsQuery,
				variables: variables,
			}),
			cache: "no-cache",
		});

		const responseText = await response.text();

		if (!response.ok) {
			console.error(
				`API request failed. Status: ${response.status}. Response: ${responseText}`
			);
			throw new Error(`API request failed: ${response.status}`);
		}

		const json = JSON.parse(responseText) as GraphQLResponse;

		if (json.errors) {
			console.error("GraphQL Errors:", json.errors);
			throw new Error("GraphQL errors occurred fetching posts.");
		}

		const publicationData = json.data?.publication;
		if (!publicationData?.posts) {
			console.warn("No posts found in publication data");
			return { posts: [], hasMore: false, endCursor: null };
		}

		const edges = publicationData.posts.edges || [];
		const pageInfo = publicationData.posts.pageInfo || {};

		const posts: HashnodePost[] = edges.map(
			(edge): HashnodePost => ({
				id: edge.node.id,
				slug: edge.node.slug,
				title: edge.node.title || "Untitled",
				subtitle: edge.node.subtitle || "",
				content: "",
				brief: "",
				coverImage: edge.node.coverImage?.url
					? { src: edge.node.coverImage.url }
					: null,
				publishedAt: edge.node.publishedAt || "",
				tags: [],
			})
		);

		return {
			posts,
			hasMore: !!pageInfo.hasNextPage && posts.length > 0,
			endCursor: pageInfo.endCursor,
		};
	} catch (error) {
		console.error("Failed to fetch posts:", error);
		throw new Error(
			error instanceof Error
				? error.message
				: "Failed to fetch posts from source."
		);
	}
}

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
			console.error("HASHNODE_HOST is missing!");
			return null;
		}

		const variables = { slug, host: HASHNODE_HOST };

		const response: Response = await fetch(HASHNODE_ENDPOINT, {
			method: "POST",
			headers: getHeaders(),
			body: JSON.stringify({ query: query, variables: variables }),
			cache: "no-cache",
		});

		if (!response.ok) {
			const errorBody = await response
				.text()
				.catch(() => "Could not read error body");
			console.error(
				`API request failed fetching post ${slug}: ${response.status} ${response.statusText}. Body: ${errorBody}`
			);
			return null;
		}

		const json = (await response.json()) as GraphQLResponse;

		if (json.errors) {
			console.error(`GraphQL Errors for slug ${slug}:`, json.errors);
			return null;
		}

		const postData = json.data?.publication?.post;
		if (!postData) {
			console.warn(`No post data found for slug ${slug}`);
			return null;
		}

		return {
			id: postData.id,
			slug,
			title: postData.title || "Untitled",
			subtitle: postData.subtitle || "",
			content: postData.content?.html || "",
			brief: postData.brief || "",
			coverImage: postData.coverImage?.url
				? { src: postData.coverImage.url }
				: null,
			publishedAt: postData.publishedAt || "",
			tags: postData.tags || [],
		};
	} catch (error) {
		console.error(`Failed to fetch post "${slug}":`, error);
		return null;
	}
}

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
          edges {
            node {
              id
              title
              subtitle
              slug
              brief
              content { html }
              publishedAt
              coverImage { url }
              tags { name slug }
            }
          }
          pageInfo { hasNextPage endCursor }
        }
      }
    }
  `;

	if (typeof HASHNODE_HOST === "undefined" || !HASHNODE_HOST) {
		console.error("HASHNODE_HOST is missing!");
		return [];
	}

	console.log("Starting fetch for search index...");

	while (hasNext && attempts < maxAttempts) {
		attempts++;
		const variables = {
			first: batchSize,
			after: cursor,
			host: HASHNODE_HOST,
		};

		try {
			const response: Response = await fetch(HASHNODE_ENDPOINT, {
				method: "POST",
				headers: getHeaders(),
				body: JSON.stringify({
					query: allPostsQuery,
					variables: variables,
				}),
				cache: "no-cache",
			});

			if (!response.ok) {
				const errorBody = await response
					.text()
					.catch(() => "Could not read error body");
				console.error(
					`API request failed attempt ${attempts}: ${response.status} ${response.statusText}. Body: ${errorBody}`
				);
				throw new Error(`API request failed: ${response.status}`);
			}

			const json = (await response.json()) as GraphQLResponse;
			if (json.errors) {
				console.error(
					`GraphQL Errors (attempt ${attempts}):`,
					json.errors
				);
				throw new Error("GraphQL errors occurred during getAllPosts.");
			}

			const publicationData = json.data?.publication;
			if (!publicationData?.posts) {
				console.warn(`No posts data found in attempt ${attempts}.`);
				hasNext = false;
				break;
			}

			const edges = publicationData.posts.edges || [];
			const pageInfo = publicationData.posts.pageInfo || {};

			if (edges.length > 0) {
				const batchPosts: HashnodePost[] = edges.map(
					(edge): HashnodePost => ({
						id: edge.node.id,
						slug: edge.node.slug,
						title: edge.node.title || "Untitled",
						subtitle: edge.node.subtitle || "",
						content: edge.node.content?.html || "",
						brief: edge.node.brief || "",
						coverImage: edge.node.coverImage?.url
							? { src: edge.node.coverImage.url }
							: null,
						publishedAt: edge.node.publishedAt || "",
						tags: edge.node.tags || [],
					})
				);
				allPosts = [...allPosts, ...batchPosts];
				console.log(
					`Fetched batch ${attempts}, total posts: ${allPosts.length}`
				);
			}

			if (!pageInfo.hasNextPage) {
				hasNext = false;
				console.log("No more pages according to pageInfo.");
			} else {
				cursor = pageInfo.endCursor;
				if (!cursor) {
					console.warn(
						"HasMore is true but endCursor is null. Breaking loop."
					);
					hasNext = false;
				}
			}

			if (hasNext)
				await new Promise((resolve) => setTimeout(resolve, 300));
		} catch (error) {
			console.error(`Error during fetch attempt ${attempts}:`, error);
			hasNext = false;
			break;
		}
	}

	console.log(`Finished fetching. Total posts indexed: ${allPosts.length}`);
	return allPosts;
}
