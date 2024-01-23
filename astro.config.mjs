import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import cloudflare from "@astrojs/cloudflare";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
	site: "https://kafkaesque.blog/",
	output: "server",
	integrations: [tailwind({ applyBaseStyles: false }), sitemap(), react()],
	vite: {
		resolve: {
			alias: {
				"@": "/src",
			},
		},
	},
	image:
		process.env.NODE_ENV === "production"
			? {
					service: {
						entrypoint: "@astrojs/cloudflare/image-service",
					},
			  }
			: {},
	adapter: cloudflare(),
});
