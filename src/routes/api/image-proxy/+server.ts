import { error } from "@sveltejs/kit";
import sharp from "sharp";

// Allowed domain for image proxying
const ALLOWED_DOMAIN = "cdn.hashnode.com";
// Cache duration for proxied images (e.g., 7 days)
const CACHE_DURATION_SECONDS = 60 * 60 * 24 * 7;

export async function GET({ url, request }) {
	// Add 'request' to access headers
	const imageUrl = url.searchParams.get("url");
	const widthParam = url.searchParams.get("w");
	const heightParam = url.searchParams.get("h");
	const qualityParam = url.searchParams.get("q");

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

	console.log(`Image Proxy: Requesting ${imageUrl}`);

	try {
		// Fetch the original image
		const response = await fetch(targetUrl.toString(), {
			headers: { "User-Agent": "JacobWeinbren-Blog-ImageProxy/1.0" },
		});

		if (!response.ok) {
			console.error(
				`Image Proxy: Failed to fetch original image ${imageUrl}. Status: ${response.status}`
			);
			error(
				response.status,
				`Failed to fetch original image: ${response.statusText}`
			);
		}

		const contentType = response.headers.get("content-type");
		if (!contentType || !contentType.startsWith("image/")) {
			console.error(
				`Image Proxy: Original URL ${imageUrl} did not return an image. Content-Type: ${contentType}`
			);
			error(400, "Original URL is not an image");
		}

		// Get image data as buffer
		const imageBuffer = Buffer.from(await response.arrayBuffer());

		// --- Image Processing with Sharp ---
		let transformer = sharp(imageBuffer);

		// Resize if width or height is provided
		const width = widthParam ? parseInt(widthParam, 10) : null;
		const height = heightParam ? parseInt(heightParam, 10) : null;
		if (!isNaN(width as number) || !isNaN(height as number)) {
			console.log(
				`Image Proxy: Resizing to W: ${width ?? "auto"}, H: ${height ?? "auto"}`
			);
			transformer = transformer.resize(width, height, {
				fit: "cover", // Adjust fit as needed ('contain', 'inside', 'outside')
				withoutEnlargement: true,
			});
		}

		// Determine desired quality
		const quality = qualityParam ? parseInt(qualityParam, 10) : 75; // Default quality 75
		const clampedQuality = Math.max(
			10,
			Math.min(100, isNaN(quality) ? 75 : quality)
		); // Clamp 10-100

		// --- Format Conversion (AVIF/WebP) ---
		let outputBuffer: Buffer;
		let outputContentType: string;

		// Check client Accept header for AVIF support
		const acceptsAvif = request.headers
			.get("accept")
			?.includes("image/avif");

		if (acceptsAvif) {
			console.log(
				`Image Proxy: Converting to AVIF (Quality: ${clampedQuality})`
			);
			try {
				outputBuffer = await transformer
					.avif({ quality: clampedQuality })
					.toBuffer();
				outputContentType = "image/avif";
			} catch (avifError) {
				console.warn(
					`Image Proxy: AVIF conversion failed for ${imageUrl}, falling back to WebP. Error: ${avifError}`
				);
				// Fallback to WebP if AVIF fails (rare, but possible)
				outputBuffer = await transformer
					.webp({ quality: clampedQuality })
					.toBuffer();
				outputContentType = "image/webp";
			}
		} else {
			console.log(
				`Image Proxy: Converting to WebP (Quality: ${clampedQuality})`
			);
			outputBuffer = await transformer
				.webp({ quality: clampedQuality })
				.toBuffer();
			outputContentType = "image/webp";
		}
		// --- End Image Processing ---

		console.log(
			`Image Proxy: Successfully processed ${imageUrl} to ${outputContentType}`
		);

		// Return the optimized image
		return new Response(outputBuffer, {
			status: 200,
			headers: {
				"Content-Type": outputContentType,
				"Cache-Control": `public, max-age=${CACHE_DURATION_SECONDS}, immutable`,
				"Content-Length": outputBuffer.length.toString(),
				// Optional: Add Vary header if content negotiation affects caching (e.g., based on Accept)
				Vary: "Accept",
			},
		});
	} catch (err: any) {
		console.error(`Image Proxy: Error processing image ${imageUrl}:`, err);
		if (err.status) {
			throw err; // Re-throw SvelteKit errors
		} else {
			error(500, "Failed to process image");
		}
	}
}
