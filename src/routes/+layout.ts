import { dev } from "$app/environment";
import type { LayoutLoad } from "./$types";
import { injectAnalytics } from "@vercel/analytics/sveltekit";
import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
 
injectSpeedInsights();
injectAnalytics({ mode: dev ? "development" : "production" });

// Explicitly type the function parameter using LayoutLoad
export const load: LayoutLoad = ({ url }) => {
	// The 'url' parameter is now correctly typed because LayoutLoad defines it
	return {
		url: url, // This defines the shape of LayoutData
	};
};
