import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel/serverless";
import minify from "astro-min";

// https://astro.build/config
export default defineConfig({
	output: "server",
	integrations: [tailwind(), minify()],
	adapter: vercel(),
});
