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
	}),
	image: {
		domains: ["cdn.hashnode.com"], // Add Hashnode's domain
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
		},
		resolve: {
			alias: {
				"@": "/src",
			},
		},
	},
});
