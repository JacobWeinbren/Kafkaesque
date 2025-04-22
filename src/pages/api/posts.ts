import type { APIRoute } from "astro";
import { getPosts } from "@/lib/hashnode"; // Use the optimized getPosts

export const GET: APIRoute = async ({ request }) => {
	const url = new URL(request.url);
	const cursor = url.searchParams.get("cursor");
	const postsPerPage = 6; 

	try {
		// Fetch posts using the optimized function
		const data = await getPosts({
			limit: postsPerPage,
			after: cursor,
		});

		const headers = new Headers({
			"Content-Type": "application/json",
			"Cache-Control":
				"public, max-age=60, s-maxage=60, stale-while-revalidate=300",
		});

		return new Response(JSON.stringify(data), {
			status: 200,
			headers: headers,
		});
	} catch (error) {
		console.error("API route /api/posts error:", error);
		// Don't cache errors for long
		return new Response(
			JSON.stringify({ error: "Failed to fetch posts from source" }),
			{
				status: 500,
				headers: {
					"Content-Type": "application/json",
					"Cache-Control": "public, max-age=10, s-maxage=10", // Cache errors briefly
				},
			}
		);
	}
};
