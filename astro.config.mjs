import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
	site: "https://kafkaesque.blog/",
	output: "server",
	integrations: [tailwind(), sitemap()],
	vite: {
		resolve: {
			alias: {
				"@": "/src",
			},
		},
	},
	image: {
		service: {
			entrypoint: "@astrojs/cloudflare/image-service",
		},
	},
	adapter: cloudflare(),
});
