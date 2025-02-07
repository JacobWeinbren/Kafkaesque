import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel";

export default defineConfig({
	integrations: [
		tailwind({
			config: { applyBaseStyles: false },
		}),
		react(),
	],
	output: "server",
	adapter: vercel({
		analytics: true,
	}),
	prefetch: {
		prefetchAll: true,
		defaultStrategy: "hover",
	},
	vite: {
		resolve: {
			alias: {
				"@": "/src",
			},
		},
	},
});
