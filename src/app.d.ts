// src/app.d.ts

// Add type declarations for modules that don't have them
declare module "svelte-icons/fa" {
	import { SvelteComponent } from "svelte";
	// Add specific components you use if you want stricter typing,
	// otherwise just declaring the module might be enough to silence the error.
	export class FaGithub extends SvelteComponent {}
	export class FaLinkedin extends SvelteComponent {}
	// Add other Fa icons if needed
}

// You can also add global types here if necessary
// interface Locals { ... }
// interface PageData { ... } // Global PageData if needed
// interface Platform { ... }
