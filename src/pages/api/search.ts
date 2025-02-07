// src/pages/api/search.ts
import type { APIRoute } from "astro";
import { getPosts } from "@/lib/hashnode";
import Fuse from "fuse.js";

let fuse: Fuse<any> | null = null;

export const GET: APIRoute = async ({ url }) => {
	const query = url.searchParams.get("q");

	if (!query) {
		return new Response(JSON.stringify([]), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	}

	try {
		if (!fuse) {
			const { posts } = await getPosts();
			fuse = new Fuse(posts, {
				keys: ["title", "brief", "content"],
				threshold: 0.3,
				includeScore: true,
			});
		}

		const results = fuse
			.search(query)
			.filter((result) => result.score && result.score < 0.7)
			.map((result) => result.item);

		return new Response(JSON.stringify(results.slice(0, 9)), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("Search error:", error);
		return new Response(JSON.stringify({ error: "Search failed" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
};
