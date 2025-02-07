// src/lib/ghost.ts
import { TSGhostContentAPI } from "@ts-ghost/content-api";

const api = new TSGhostContentAPI(
	"https://kafkaesque.digitalpress.blog",
	import.meta.env.PUBLIC_CONTENT_API_KEY || "",
	"v5.47.0"
);

export async function getPosts(options = {}) {
	try {
		const response = await api.posts
			.browse({
				limit: "all",
				...options,
			})
			.fetch();

		if (!response.success) {
			const errorResponse = response as {
				success: false;
				errors: Array<{ message: string; type: string }>;
			};
			console.error(
				"Ghost API Error:",
				errorResponse.errors.map((e) => e.message).join(", ")
			);
			return [];
		}

		return response.data as GhostPost[];
	} catch (error) {
		console.error("Failed to fetch posts:", error);
		return [];
	}
}

export async function getPost(slug: string) {
	try {
		const response = await api.posts
			.read({
				slug,
			})
			.fetch();

		if (!response.success) {
			// Type guard to handle the error case
			const errorResponse = response as {
				success: false;
				errors: Array<{ message: string; type: string }>;
			};
			console.error(
				"Ghost API Error:",
				errorResponse.errors.map((e) => e.message).join(", ")
			);
			return null;
		}

		return response.data;
	} catch (error) {
		console.error("Failed to fetch post:", error);
		return null;
	}
}

// Add TypeScript interfaces for better type safety
export interface GhostPost {
	id: string;
	slug: string;
	title: string;
	html: string;
	excerpt: string;
	feature_image?: string;
	published_at: string;
	// Add other fields as needed
}

export interface GhostError {
	message: string;
	type: string;
}
