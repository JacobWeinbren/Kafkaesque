import { error } from "@sveltejs/kit";

export async function GET({ url, fetch }) {
	const imageUrl = url.searchParams.get("url");

	if (!imageUrl) {
		throw error(400, "Missing image URL");
	}

	try {
		// For now, just proxy the original image
		// In production, you might want to use a service like Cloudinary or implement image optimization
		const response = await fetch(imageUrl);

		if (!response.ok) {
			throw error(response.status, "Failed to fetch image");
		}

		const buffer = await response.arrayBuffer();
		const contentType =
			response.headers.get("content-type") || "image/jpeg";

		return new Response(buffer, {
			headers: {
				"Content-Type": contentType,
				"Cache-Control": "public, max-age=31536000", // Cache for 1 year
			},
		});
	} catch (err: unknown) {
		console.error("Image proxy error:", err);
		throw error(500, "Failed to process image");
	}
}
