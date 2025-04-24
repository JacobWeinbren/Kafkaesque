// vite.config.ts
import { defineConfig } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
	plugins: [sveltekit(), tailwindcss()],
	ssr: {
		// Add the specific subpath for svelte-icons
		noExternal: ["lucide-svelte", "svelte-icons", "svelte-icons/fa"],
	},
});
