import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
	output: "server",
	integrations: [
		tailwind({
			applyBaseStyles: false,
		}),
		sitemap(),
		react(),
	],
	vite: {
		resolve: {
			alias: {
				"@": "/src",
			},
		},
	},
	redirects: {
		"/blog": "/blog/1",
	},
	adapter: cloudflare({
		imageService: "cloudflare",
	}),
});
