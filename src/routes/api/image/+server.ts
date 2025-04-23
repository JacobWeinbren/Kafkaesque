// api/image/+server.ts
import { error } from "@sveltejs/kit";
import sharp from "sharp";

const ALLOWED_DOMAIN = "cdn.hashnode.com";
// Cache duration for Vercel's Edge and browser caches (1 week)
const CACHE_DURATION_SECONDS = 60 * 60 * 24 * 7;

// No Redis or in-memory cache needed here - relying on Vercel's Edge Cache

export async function GET({ url }) {
	const imageUrl = url.searchParams.get("url");
	const width = url.searchParams.get("w");
	const height = url.searchParams.get("h");
	const quality = url.searchParams.get("q") || "75"; // Default quality

	if (!imageUrl) {
		error(400, "Missing image URL parameter");
	}

	let targetUrl: URL;
	try {
		targetUrl = new URL(imageUrl);
	} catch (e) {
		error(400, "Invalid image URL parameter");
	}

	// Security check: Only allow images from the specified domain
	if (targetUrl.hostname !== ALLOWED_DOMAIN) {
		console.warn(`Image proxy denied for domain: ${targetUrl.hostname}`);
		error(403, "Image host not allowed");
	}

	// Vercel's cache key is automatically derived from the full URL,
	// including query parameters (url, w, h, q). No manual key needed here.

	try {
		// Fetch the original image
		// Increased timeout slightly for potentially slower upstream fetches
		const fetchSignal = AbortSignal.timeout(15000); // 15 second timeout
		const response = await fetch(targetUrl.toString(), {
			headers: {
				// Identify our proxy to the source server
				"User-Agent": "Blog-ImageOptimizer/1.0 (Vercel Proxy)",
			},
			signal: fetchSignal,
		});

		if (!response.ok) {
			console.error(
				`Failed to fetch image: ${response.status} ${response.statusText} from ${imageUrl}`
			);
			// Return 502 Bad Gateway for upstream server errors
			error(
				response.status >= 500 ? 502 : response.status,
				`Failed to fetch image: ${response.statusText}`
			);
		}

		const sourceContentType = response.headers.get("content-type");
		if (!sourceContentType?.startsWith("image/")) {
			console.error(
				`URL did not return an image: ${sourceContentType} from ${imageUrl}`
			);
			error(400, "URL is not an image");
		}

		// Get the image data as a Buffer
		const imageBuffer = Buffer.from(await response.arrayBuffer());

		// --- Image Processing with Sharp ---

		// Parse and sanitize parameters
		const widthInt = width ? parseInt(width, 10) : null;
		const heightInt = height ? parseInt(height, 10) : null;
		// Ensure quality is between 10 and 100
		const qualityInt = Math.max(
			10,
			Math.min(100, parseInt(quality, 10) || 75)
		);

		let transformer = sharp(imageBuffer);

		// Apply resize transformation if width or height is provided
		if (widthInt || heightInt) {
			transformer = transformer.resize(widthInt, heightInt, {
				fit: "cover", // Crop to cover dimensions without distorting aspect ratio
				withoutEnlargement: true, // Don't upscale smaller images
			});
		}

		// Convert to WebP format for optimal compression and quality
		const outputContentType = "image/webp";
		const outputBuffer = await transformer
			.webp({ quality: qualityInt })
			.toBuffer();

		// --- End Image Processing ---

		console.log(
			`Successfully processed: ${imageUrl} (w=${widthInt}, h=${heightInt}, q=${qualityInt})`
		);

		// Return the processed image with appropriate caching headers
		// Vercel's Edge Network will respect these headers
		return new Response(outputBuffer, {
			status: 200,
			headers: {
				"Content-Type": outputContentType,
				"Content-Length": outputBuffer.length.toString(),
				// This header instructs Vercel Edge & browsers to cache
				"Cache-Control": `public, max-age=${CACHE_DURATION_SECONDS}, immutable`,
				// Optional: Add header to indicate it was processed (useful for debugging)
				"X-Image-Processed": "true",
			},
		});
	} catch (err: any) {
		// Handle specific errors for better feedback
		if (err.name === "TimeoutError" || err.name === "AbortError") {
			console.error(`Fetch timeout for ${imageUrl}:`, err);
			error(504, "Timeout fetching the upstream image"); // 504 Gateway Timeout
		}
		// Handle Sharp processing errors (e.g., unsupported format)
		if (
			err.message.includes("Input buffer") ||
			err.message.includes("format")
		) {
			console.error(
				`Sharp processing error for ${imageUrl}:`,
				err.message
			);
			error(400, "Unsupported or invalid image format");
		}

		// Generic error handler
		console.error(`Image processing error for ${imageUrl}:`, err);
		error(500, "Failed to process image");
	}
}
