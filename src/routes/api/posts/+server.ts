import { json } from "@sveltejs/kit";
import { getPosts } from "$lib/server/hashnode";

export async function GET({ url }) {
	try {
		const cursor = url.searchParams.get("cursor");
		const limit = Number.parseInt(url.searchParams.get("limit") || "6");

		const result = await getPosts({
			limit,
			after: cursor,
		});

		return json(result);
	} catch (error: unknown) {
		console.error("API /api/posts error:", error);
		return json(
			{
				error:
					error instanceof Error
						? error.message
						: "Failed to fetch posts",
			},
			{ status: 500 }
		);
	}
}
