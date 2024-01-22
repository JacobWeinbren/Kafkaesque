import { defineConfig } from "astro/config";
import vercelServerless from "@astrojs/vercel/serverless";
import Compress from "astro-compress";

// https://astro.build/config
export default defineConfig({
	output: "server",
	adapter: vercelServerless(),
	integrations: [Compress()],
});
