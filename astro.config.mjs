import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel";
import compress from "astro-compress";

export default defineConfig({
	integrations: [
		tailwind({
			config: { applyBaseStyles: false },
		}),
		react(),
		compress(),
	],
	output: "server",
	adapter: vercel({
		analytics: true,
		imageService: true,
		maxDuration: 60, // Add timeout configuration
	}),
	image: {
		domains: ["cdn.hashnode.com"],
		remotePatterns: [
			{
				protocol: "https",
				hostname: "cdn.hashnode.com",
			},
		],
	},
	prefetch: {
		prefetchAll: true,
		defaultStrategy: "viewport",
	},
	vite: {
		build: {
			cssMinify: true,
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
		resolve: {
			alias: {
				"@": "/src",
			},
		},
		ssr: {
			noExternal: ["@heroicons/react"],
		},
	},
});
