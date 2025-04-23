// api/image-proxy/+server.ts
import { error } from "@sveltejs/kit";

// Allowed domain for image proxying
const ALLOWED_DOMAIN = "cdn.hashnode.com";

export async function GET({ url }) {
	const imageUrl = url.searchParams.get("url");
	const width = url.searchParams.get("w") || "800";
	const height = url.searchParams.get("h") || "0";
	const quality = url.searchParams.get("q") || "75";

	if (!imageUrl) {
		error(400, "Missing image URL parameter");
	}

	let targetUrl: URL;
	try {
		targetUrl = new URL(imageUrl);
	} catch (_) {
		error(400, "Invalid image URL format");
	}

	// Security: Ensure we only proxy images from the allowed domain
	if (targetUrl.hostname !== ALLOWED_DOMAIN) {
		console.warn(
			`Image Proxy: Denied request for domain: ${targetUrl.hostname}`
		);
		error(403, "Image host not allowed");
	}

	// Construct URL to Vercel's Image Optimization API
	const vercelImageUrl = new URL("/_vercel/image", url.origin);
	vercelImageUrl.searchParams.set("url", imageUrl);
	vercelImageUrl.searchParams.set("w", width);
	vercelImageUrl.searchParams.set("q", quality);

	if (height !== "0") {
		vercelImageUrl.searchParams.set("h", height);
	}

	vercelImageUrl.searchParams.set("fit", "cover");
	vercelImageUrl.searchParams.set("format", "webp"); // Always use WebP for better performance

	// Redirect to Vercel's image optimizer
	return new Response(null, {
		status: 302,
		headers: {
			Location: vercelImageUrl.toString(),
		},
	});
}
