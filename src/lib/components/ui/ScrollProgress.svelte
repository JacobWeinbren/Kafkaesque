<script lang="ts">
import { onMount } from "svelte";
import { writable } from "svelte/store";

const progress = writable(0);
let mounted = false;

function updateProgress() {
	const scrolled = window.scrollY;
	const maxHeight = document.documentElement.scrollHeight - window.innerHeight;
	const progressPercent = maxHeight > 0 ? (scrolled / maxHeight) * 100 : 0;
	progress.set(Math.min(progressPercent, 100));
}

onMount(() => {
	mounted = true;
	window.addEventListener("scroll", updateProgress);
	updateProgress();

	return () => {
		window.removeEventListener("scroll", updateProgress);
	};
});
</script>

{#if mounted}
	<div class="fixed top-0 left-0 right-0 z-50 h-1 bg-slate-200/50 dark:bg-slate-800/50">
		<div 
			class="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-150 ease-out"
			style="width: {$progress}%"
		></div>
	</div>
{/if}