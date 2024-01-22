import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel/serverless";
import sitemap from "@astrojs/sitemap";
import compress from "astro-compress";

// https://astro.build/config
export default defineConfig({
	site: "https://kafkaesque.blog/",
	output: "server",
	integrations: [tailwind(), sitemap(), compress()],
	adapter: vercel({
		webAnalytics: {
			enabled: true,
		},
	}),
	vite: {
		resolve: {
			alias: {
				"@": "/src",
			},
		},
	},
});
