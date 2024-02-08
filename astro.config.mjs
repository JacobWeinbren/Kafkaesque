import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
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
	redirects: {
		"/blog": "/blog/1",
	},
	adapter: vercel(),
});
