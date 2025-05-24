import { dev } from "$app/environment";
import type { LayoutLoad } from "./$types";
import { injectAnalytics } from "@vercel/analytics/sveltekit";
import { injectSpeedInsights } from "@vercel/speed-insights/sveltekit";

injectSpeedInsights();
injectAnalytics({ mode: dev ? "development" : "production" });

export type LayoutDataShape = {
	url: {
		href: string;
		pathname: string;
		origin: string;
	};
};

export const load: LayoutLoad = ({ url }): LayoutDataShape => {
	return {
		url: {
			href: url.href,
			pathname: url.pathname,
			origin: url.origin,
		},
	};
};
