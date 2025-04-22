import { error } from "@sveltejs/kit";
import sharp from "sharp";
// Removed: fs, path, crypto - no longer needed for filesystem cache

// Allowed domain for image proxying
const ALLOWED_DOMAIN = "cdn.hashnode.com";
// Cache duration for proxied images (e.g., 7 days) - Used ONLY for Cache-Control header
const CACHE_DURATION_SECONDS = 60 * 60 * 24 * 7;

// Removed: CACHE_DIR and ensureCacheDirExists logic
// Removed: generateCacheKey function

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

	// Determine format based on Accept header
	const acceptsAvif = request.headers.get("accept")?.includes("image/avif");
	// Default to webp if AVIF is not accepted or fails
	const requestedFormat = acceptsAvif ? "avif" : "webp";

	// --- Cache Check Removed - Vercel Edge Cache handles this ---
	// The function will now always process the image if it's not in Vercel's Edge Cache.

	console.log(
		`Image Proxy: Processing request for ${imageUrl} (Format: ${requestedFormat})`
	);

	try {
		// Fetch the original image
		const response = await fetch(targetUrl.toString(), {
			headers: { "User-Agent": "JacobWeinbren-Blog-ImageProxy/1.0" },
		});

		if (!response.ok) {
			console.error(
				`Image Proxy: Failed to fetch original image ${imageUrl}. Status: ${response.status}`
			);
			// Important: Don't cache error responses long-term, or use a shorter max-age
			return new Response(
				`Failed to fetch original image: ${response.statusText}`,
				{
					status: response.status,
					headers: {
						"Cache-Control": "public, max-age=60", // Cache errors briefly
					},
				}
			);
		}

		const contentType = response.headers.get("content-type");
		if (!contentType || !contentType.startsWith("image/")) {
			console.error(
				`Image Proxy: Original URL ${imageUrl} did not return an image. Content-Type: ${contentType}`
			);
			// Important: Don't cache error responses long-term
			return new Response("Original URL is not an image", {
				status: 400,
				headers: {
					"Cache-Control": "public, max-age=60", // Cache errors briefly
				},
			});
		}

		// Get image data as buffer
		const imageBuffer = Buffer.from(await response.arrayBuffer());

		// --- Image Processing with Sharp ---
		let transformer = sharp(imageBuffer);

		// Resize if width or height is provided
		const width = widthParam ? parseInt(widthParam, 10) : null;
		const height = heightParam ? parseInt(heightParam, 10) : null;
		if (
			(width !== null && !isNaN(width)) ||
			(height !== null && !isNaN(height))
		) {
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

		if (requestedFormat === "avif") {
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
				// Fallback to WebP if AVIF fails
				outputBuffer = await transformer
					.webp({ quality: clampedQuality })
					.toBuffer();
				outputContentType = "image/webp";
			}
		} else {
			// Default to WebP
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

		// --- Filesystem Write Removed ---

		// Return the optimized image with Vercel-friendly cache headers
		return new Response(outputBuffer, {
			status: 200,
			headers: {
				"Content-Type": outputContentType,
				// This tells Vercel's Edge and browsers to cache the response
				"Cache-Control": `public, max-age=${CACHE_DURATION_SECONDS}, immutable`,
				"Content-Length": outputBuffer.length.toString(),
				// Crucial: Tells caches that the response varies based on the Accept header
				Vary: "Accept",
				// Optional: Indicates the function processed it (Vercel adds its own x-vercel-cache header)
				"X-Cache-Status": "PROCESSED",
			},
		});
	} catch (err: any) {
		console.error(`Image Proxy: Error processing image ${imageUrl}:`, err);
		// Return a generic error response, avoid caching it long-term
		return new Response("Failed to process image", {
			status: 500,
			headers: {
				"Cache-Control": "public, max-age=60", // Cache server errors briefly
			},
		});
	}
}
