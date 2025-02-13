import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel";
import compress from "astro-compress";
import critters from "astro-critters";

export default defineConfig({
	integrations: [
		tailwind(),
		react(),
		compress({
			css: true,
			html: true,
			js: true,
			img: true,
			svg: true,
		}),
		critters({
			preload: "media",
			inlineFonts: true,
		}),
	],
	output: "server",
	adapter: vercel({
		analytics: true,
		imageService: true,
		isr: true,
	}),
	image: {
		service: {
			entrypoint: "astro/assets/services/sharp",
			config: {
				limitInputPixels: false,
			},
		},
	},
	vite: {
		build: {
			cssCodeSplit: true,
			sourcemap: true,
			minify: "terser",
		},
		optimizeDeps: {
			include: ["react", "react-dom", "@heroicons/react"],
		},
	},
});
