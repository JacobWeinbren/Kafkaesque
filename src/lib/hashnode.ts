// src/lib/hashnode.ts
const HASHNODE_ENDPOINT = "https://gql.hashnode.com";

interface HashnodePost {
	id: string;
	slug: string;
	title: string;
	subtitle: string;
	content: string;
	brief: string;
	coverImage: string | null;
	publishedAt: string;
	tags?: { name: string; slug: string }[];
}

const getHeaders = () => ({
	"Content-Type": "application/json",
	Authorization: `Bearer ${import.meta.env.HASHNODE_ACCESS_TOKEN}`,
});

export async function getPosts(options: { limit?: number } = {}) {
	try {
		// First, let's get your publication ID
		const publicationQuery = `
      query GetPublication {
        me {
          publications(first: 1) {
            edges {
              node {
                id
                title
              }
            }
          }
        }
      }
    `;

		const pubResponse = await fetch(HASHNODE_ENDPOINT, {
			method: "POST",
			headers: getHeaders(),
			body: JSON.stringify({ query: publicationQuery }),
		});

		const pubJson = await pubResponse.json();

		if (pubJson.errors) {
			console.error("Publication Query Errors:", pubJson.errors);
			return [];
		}

		const publicationId =
			pubJson.data?.me?.publications?.edges?.[0]?.node?.id;

		if (!publicationId) {
			console.error("No publication ID found");
			return [];
		}

		// Now let's get the posts using the publication ID
		const postsQuery = `
      query GetPosts($publicationId: ObjectId!, $first: Int!) {
        publication(id: $publicationId) {
          posts(first: $first) {
            edges {
              node {
                id
                title
                subtitle
                brief
                slug
                coverImage {
                  url
                }
                publishedAt
                content {
                  html
                }
                tags {
                  name
                  slug
                }
              }
            }
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
					publicationId,
					first: options.limit || 20, // Use the limit from options or default to 20
				},
			}),
		});

		const json = await response.json();

		if (json.errors) {
			console.error("Posts Query Errors:", json.errors);
			return [];
		}

		// Transform the response to match our interface
		const posts =
			json.data?.publication?.posts?.edges?.map((edge: any) => ({
				id: edge.node.id,
				slug: edge.node.slug,
				title: edge.node.title,
				subtitle: edge.node.subtitle || "",
				content: edge.node.content.html,
				brief: edge.node.brief,
				coverImage: edge.node.coverImage?.url || null,
				publishedAt: edge.node.publishedAt,
				tags: edge.node.tags,
			})) || [];

		return posts as HashnodePost[];
	} catch (error) {
		console.error("Failed to fetch posts:", error);
		return [];
	}
}

export async function getPost(slug: string) {
	try {
		const query = `
      query GetPost($slug: String!) {
        publication(host: "kafkaesque.hashnode.dev") {
          post(slug: $slug) {
            id
            title
            subtitle
            content {
              html
            }
            brief
            coverImage {
              url
            }
            publishedAt
            tags {
              name
              slug
            }
          }
        }
      }
    `;

		const response = await fetch(HASHNODE_ENDPOINT, {
			method: "POST",
			headers: getHeaders(),
			body: JSON.stringify({
				query,
				variables: { slug },
			}),
		});

		const json = await response.json();

		if (json.errors) {
			console.error("GraphQL Errors:", json.errors);
			return null;
		}

		const post = json.data?.publication?.post;

		if (!post) return null;

		// Transform the response to match our interface
		return {
			id: post.id,
			slug: post.slug,
			title: post.title,
			subtitle: post.subtitle || "",
			content: post.content.html,
			brief: post.brief,
			coverImage: post.coverImage?.url || null,
			publishedAt: post.publishedAt,
			tags: post.tags,
		} as HashnodePost;
	} catch (error) {
		console.error("Failed to fetch post:", error);
		return null;
	}
}
