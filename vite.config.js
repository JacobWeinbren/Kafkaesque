// vite.config.ts
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

console.log("--- Loading vite.config.ts ---");

export default defineConfig({
	plugins: [sveltekit()],
	ssr: {
		// Add the specific subpath for svelte-icons
		noExternal: ["lucide-svelte", "svelte-icons", "svelte-icons/fa"],
	},
});
