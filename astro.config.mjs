// astro.config.mjs
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel";
import compress from "astro-compress";
import sitemap from "@astrojs/sitemap";

import svelte from "@astrojs/svelte";

export default defineConfig({
	site: "https://kafkaesque.blog",
	integrations: [
		tailwind({ config: { applyBaseStyles: false } }),
		react(),
		compress({ css: true, html: true, img: true, js: true, svg: true }),
		sitemap(),
		svelte(),
	],
	output: "server",
	adapter: vercel({
		imageService: true,
		maxDuration: 60,
		edgeMiddleware: true,
		webAnalytics: {
			enabled: true,
		},
	}),
	image: {
		domains: ["cdn.hashnode.com"],
		remotePatterns: [{ protocol: "https", hostname: "cdn.hashnode.com" }],
		format: ["avif", "webp"],
		serviceEntryPoint: "@astrojs/image/sharp",
	},
	prefetch: { prefetchAll: true },
	vite: {
		build: {
			cssMinify: "lightningcss",
			minify: true,
			rollupOptions: {
				output: {
					manualChunks: {
						"react-vendor": ["react", "react-dom"],
						search: ["fuse.js", "lodash/debounce"],
					},
				},
			},
		},
		ssr: { noExternal: ["@heroicons/react"] },
		resolve: { alias: { "@": "/src" } },
	},
});
