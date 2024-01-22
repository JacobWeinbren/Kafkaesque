import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
	output: "server",
	integrations: [tailwind()],
	adapter: cloudflare(),
	image: {
		service: {
			entrypoint: "@astrojs/cloudflare/image-service",
		},
	},
});
