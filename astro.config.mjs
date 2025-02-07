// astro.config.mjs
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";

export default defineConfig({
	integrations: [
		tailwind({
			config: { applyBaseStyles: false },
		}),
		react(),
	],
	output: "server",
	vite: {
		resolve: {
			alias: {
				"@": "/src",
			},
		},
	},
});
