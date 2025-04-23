// api/image/+server.ts
import { error } from "@sveltejs/kit";
import sharp from "sharp";

const ALLOWED_DOMAIN = "cdn.hashnode.com";
const CACHE_DURATION_SECONDS = 60 * 60 * 24 * 7;
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const memoryCache = new Map();

export async function GET({ url, request }) {
	const imageUrl = url.searchParams.get("url");
	const width = url.searchParams.get("w") || "800";
	const height = url.searchParams.get("h") || "0";
	const quality = url.searchParams.get("q") || "75";
	const fit = url.searchParams.get("fit") || "cover";

	if (!imageUrl) {
		error(400, "Missing image URL parameter");
	}

	try {
		const targetUrl = new URL(imageUrl);

		// Security: Check allowed domains
		if (targetUrl.hostname !== ALLOWED_DOMAIN) {
			error(403, "Image host not allowed");
		}

		// In production, redirect to Vercel's image optimization service
		if (IS_PRODUCTION) {
			const vercelImageUrl = new URL("/_vercel/image", url.origin);
			vercelImageUrl.searchParams.set("url", imageUrl);
			vercelImageUrl.searchParams.set("w", width);
			vercelImageUrl.searchParams.set("q", quality);

			if (height !== "0") {
				vercelImageUrl.searchParams.set("h", height);
			}

			vercelImageUrl.searchParams.set("fit", fit);
			vercelImageUrl.searchParams.set("format", "webp");

			return new Response(null, {
				status: 302,
				headers: {
					Location: vercelImageUrl.toString(),
				},
			});
		}

		// In development, use optimized Sharp implementation
		const cacheKey = `${imageUrl}|w=${width}|h=${height}|q=${quality}`;

		// Check memory cache
		if (memoryCache.has(cacheKey)) {
			const { buffer, contentType } = memoryCache.get(cacheKey);
			return new Response(buffer, {
				status: 200,
				headers: {
					"Content-Type": contentType,
					"Cache-Control": `public, max-age=${CACHE_DURATION_SECONDS}, immutable`,
					"X-Cache-Status": "HIT-MEMORY",
				},
			});
		}

		const response = await fetch(targetUrl.toString(), {
			headers: { "User-Agent": "Blog-ImageProxy/1.0" },
		});

		if (!response.ok) {
			error(
				response.status,
				`Failed to fetch image: ${response.statusText}`
			);
		}

		const contentType = response.headers.get("content-type");
		if (!contentType?.startsWith("image/")) {
			error(400, "URL is not an image");
		}

		const imageBuffer = Buffer.from(await response.arrayBuffer());
		const widthInt = width ? parseInt(width, 10) : null;
		const heightInt = height !== "0" ? parseInt(height, 10) : null;
		const qualityInt = Math.max(
			10,
			Math.min(100, parseInt(quality, 10) || 75)
		);

		let transformer = sharp(imageBuffer);
		if (widthInt || heightInt) {
			transformer = transformer.resize(widthInt, heightInt, {
				fit: fit as keyof sharp.FitEnum,
				withoutEnlargement: true,
			});
		}

		const outputBuffer = await transformer
			.webp({ quality: qualityInt })
			.toBuffer();

		// Store in memory cache (manage cache size as needed)
		if (memoryCache.size > 50) {
			const firstKey = memoryCache.keys().next().value;
			memoryCache.delete(firstKey);
		}
		memoryCache.set(cacheKey, {
			buffer: outputBuffer,
			contentType: "image/webp",
		});

		return new Response(outputBuffer, {
			status: 200,
			headers: {
				"Content-Type": "image/webp",
				"Cache-Control": `public, max-age=${CACHE_DURATION_SECONDS}, immutable`,
				"Content-Length": outputBuffer.length.toString(),
			},
		});
	} catch (err) {
		console.error(`Image processing error:`, err);
		error(500, "Failed to process image");
	}
}
