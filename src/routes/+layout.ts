import { dev } from "$app/environment";
import type { LayoutLoad } from "./$types";
import { injectAnalytics } from "@vercel/analytics/sveltekit";
import { injectSpeedInsights } from "@vercel/speed-insights/sveltekit";

// Inject Vercel Analytics and Speed Insights
injectSpeedInsights(); // Call it early
injectAnalytics({ mode: dev ? "development" : "production" });

// This load function runs for every page unless overridden by a child layout/page load
export const load: LayoutLoad = ({ url }) => {
	// Pass the url object to the layout and potentially child pages
	// This allows access to pathname, href, etc. in components
	return {
		url: {
			href: url.href,
			pathname: url.pathname,
			origin: url.origin,
			// Add other url properties if needed (searchParams, hash, etc.)
		},
	};
};
