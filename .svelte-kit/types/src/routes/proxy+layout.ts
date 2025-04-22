// @ts-nocheck
import { dev } from "$app/environment";
import type { LayoutLoad } from "./$types";
import { injectAnalytics } from "@vercel/analytics/sveltekit";
import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
 
injectSpeedInsights();
injectAnalytics({ mode: dev ? "development" : "production" });

// Explicitly type the function parameter using LayoutLoad
export const load = ({ url }: Parameters<LayoutLoad>[0]) => {
	// The 'url' parameter is now correctly typed because LayoutLoad defines it
	console.log("+layout.ts load function running. URL:", url.pathname); // Add log
	return {
		url: url, // This defines the shape of LayoutData
	};
};
