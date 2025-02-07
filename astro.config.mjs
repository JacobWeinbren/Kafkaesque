// astro.config.mjs
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
	integrations: [
		tailwind({
			config: { applyBaseStyles: false },
		}),
		react(),
	],
	output: "server",
	adapter: cloudflare(),
	vite: {
		resolve: {
			alias: {
				"@": "/src",
			},
		},
	},
});
