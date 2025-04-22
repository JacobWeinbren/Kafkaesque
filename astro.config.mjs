import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel";
import sitemap from "@astrojs/sitemap";
import svelte from "@astrojs/svelte";

export default defineConfig({
	site: "https://kafkaesque.blog",
	integrations: [
		tailwind({ config: { applyBaseStyles: false } }),
		react(),
		sitemap(),
		svelte(),
	],
	output: "server",
	adapter: vercel({
		imageService: true,
		maxDuration: 60,
		edgeMiddleware: false,
		isr: true,
	}),
	image: {
		domains: ["cdn.hashnode.com"],
		remotePatterns: [{ protocol: "https", hostname: "cdn.hashnode.com" }],
		format: ["avif", "webp"],
	},
	prefetch: {
		defaultStrategy: "hover",
	},
	vite: {
		build: {
			cssMinify: "lightningcss",
			minify: true,
		},
		ssr: {
			noExternal: ["@heroicons/react", "@heroicons/react/24/outline"],
		},
		resolve: {
			alias: {
				"@": "/src",
			},
		},
		optimizeDeps: {
			include: [
				"react",
				"react-dom",
				"@heroicons/react/24/outline",
				"fuse.js",
				"lodash/debounce",
			],
		},
	},
});
