// api/image/+server.ts
import { error } from "@sveltejs/kit";
import sharp from "sharp";

const ALLOWED_DOMAIN = "cdn.hashnode.com";
const CACHE_DURATION_SECONDS = 60 * 60 * 24 * 7;

// Simple memory cache for frequently accessed images
const memoryCache = new Map();
const MAX_CACHE_SIZE = 100;

export async function GET({ url, request }) {
	const imageUrl = url.searchParams.get("url");
	const width = url.searchParams.get("w");
	const height = url.searchParams.get("h");
	const quality = url.searchParams.get("q") || "75";

	if (!imageUrl) {
		error(400, "Missing image URL parameter");
	}

	try {
		const targetUrl = new URL(imageUrl);

		// Security check
		if (targetUrl.hostname !== ALLOWED_DOMAIN) {
			console.warn(
				`Image proxy denied for domain: ${targetUrl.hostname}`
			);
			error(403, "Image host not allowed");
		}

		// Create cache key based on all parameters
		const cacheKey = `${imageUrl}|w=${width || "auto"}|h=${height || "auto"}|q=${quality}`;

		// Check memory cache
		if (memoryCache.has(cacheKey)) {
			const { buffer, contentType } = memoryCache.get(cacheKey);
			return new Response(buffer, {
				status: 200,
				headers: {
					"Content-Type": contentType,
					"Cache-Control": `public, max-age=${CACHE_DURATION_SECONDS}, immutable`,
					"Content-Length": buffer.length.toString(),
				},
			});
		}

		console.log(`Processing image: ${imageUrl}`);

		// Fetch the image with appropriate timeout
		const response = await fetch(targetUrl.toString(), {
			headers: { "User-Agent": "Blog-ImageOptimizer/1.0" },
			signal: AbortSignal.timeout(10000), // 10 second timeout
		});

		if (!response.ok) {
			console.error(
				`Failed to fetch image: ${response.status} ${response.statusText}`
			);
			error(
				response.status,
				`Failed to fetch image: ${response.statusText}`
			);
		}

		const contentType = response.headers.get("content-type");
		if (!contentType?.startsWith("image/")) {
			console.error(`URL did not return an image: ${contentType}`);
			error(400, "URL is not an image");
		}

		// Process the image with Sharp
		const imageBuffer = Buffer.from(await response.arrayBuffer());

		// Parse parameters
		const widthInt = width ? parseInt(width, 10) : null;
		const heightInt = height ? parseInt(height, 10) : null;
		const qualityInt = Math.max(
			10,
			Math.min(100, parseInt(quality, 10) || 75)
		);

		let transformer = sharp(imageBuffer);

		// Apply resize if dimensions provided
		if (widthInt || heightInt) {
			transformer = transformer.resize(widthInt, heightInt, {
				fit: "cover",
				withoutEnlargement: true,
			});
		}

		// Convert to WebP for best compression/quality ratio
		const outputBuffer = await transformer
			.webp({ quality: qualityInt })
			.toBuffer();

		// Update memory cache with LRU eviction
		if (memoryCache.size >= MAX_CACHE_SIZE) {
			const firstKey = memoryCache.keys().next().value;
			memoryCache.delete(firstKey);
		}

		memoryCache.set(cacheKey, {
			buffer: outputBuffer,
			contentType: "image/webp",
		});

		console.log(`Successfully processed: ${imageUrl}`);

		// Return the processed image
		return new Response(outputBuffer, {
			status: 200,
			headers: {
				"Content-Type": "image/webp",
				"Cache-Control": `public, max-age=${CACHE_DURATION_SECONDS}, immutable`,
				"Content-Length": outputBuffer.length.toString(),
			},
		});
	} catch (err) {
		console.error(`Image processing error for ${imageUrl}:`, err);
		error(500, "Failed to process image");
	}
}
