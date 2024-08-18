import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
import cloudflare from "@astrojs/cloudflare";
import svelte from "@astrojs/svelte";

// https://astro.build/config
export default defineConfig({
	site: "https://kafkaesque.blog/",
	output: "server",
	integrations: [
		tailwind({
			applyBaseStyles: false,
		}),
		sitemap(),
		react(),
		svelte(),
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
