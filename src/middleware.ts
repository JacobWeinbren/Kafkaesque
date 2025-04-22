export async function onRequest({ request, next }) {
	const response = await next();
	const url = new URL(request.url);

	// Add cache headers to static assets
	if (
		url.pathname.includes("/_astro/") ||
		url.pathname.endsWith(".js") ||
		url.pathname.endsWith(".css") ||
		url.pathname.match(/\.(jpg|jpeg|png|gif|svg|webp|avif|ico|woff2?)$/i)
	) {
		const newResponse = new Response(response.body, response);
		newResponse.headers.set(
			"Cache-Control",
			"public, max-age=31536000, immutable"
		);
		return newResponse;
	}

	// Add some caching for HTML pages, but allow revalidation
	if (url.pathname.endsWith("/") || url.pathname.endsWith(".html")) {
		const newResponse = new Response(response.body, response);
		newResponse.headers.set(
			"Cache-Control",
			"public, max-age=3600, stale-while-revalidate=86400"
		);
		return newResponse;
	}

	return response;
}
