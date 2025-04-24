// src/routes/+layout.ts
import { dev } from "$app/environment";
import type { LayoutLoad } from "./$types";
import { injectAnalytics } from "@vercel/analytics/sveltekit";
import { injectSpeedInsights } from "@vercel/speed-insights/sveltekit";

injectSpeedInsights();
injectAnalytics({ mode: dev ? "development" : "production" });

// Define the shape of the data this load function returns
export type LayoutDataShape = {
	url: {
		href: string;
		pathname: string;
		origin: string;
	};
};

// Use the defined type as the return type for the load function
export const load: LayoutLoad = ({ url }): LayoutDataShape => {
	// --- Add Logging ---
	console.log("[src/routes/+layout.ts] Load function executing...");
	console.log(
		"[src/routes/+layout.ts] Received URL object:",
		JSON.stringify(url)
	);

	const dataToReturn: LayoutDataShape = {
		url: {
			href: url.href,
			pathname: url.pathname,
			origin: url.origin,
		},
	};

	console.log(
		"[src/routes/+layout.ts] Returning data:",
		JSON.stringify(dataToReturn)
	);
	// --- End Logging ---

	return dataToReturn;
};
