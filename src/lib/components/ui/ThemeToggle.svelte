<!-- src/lib/components/ui/ThemeToggle.svelte -->
<script lang="ts">
import { Sun, Moon } from "lucide-svelte";
import type { Writable } from "svelte/store";

export let theme: Writable<"light" | "dark">;
export let toggleTheme: () => void;
</script>

<button
	on:click={toggleTheme}
	class="group relative p-3 rounded-2xl glass-card hover:scale-110 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-xl"
	aria-label="Toggle theme"
>
	<div class="relative w-6 h-6">
		{#if $theme === 'light'}
			<Moon class="absolute inset-0 w-6 h-6 text-slate-700 dark:text-slate-300 transition-all duration-300 group-hover:rotate-12" />
		{:else}
			<Sun class="absolute inset-0 w-6 h-6 text-yellow-500 transition-all duration-300 group-hover:rotate-12" />
		{/if}
	</div>
	
	<!-- Tooltip -->
	<div class="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
		{$theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
	</div>
</button>