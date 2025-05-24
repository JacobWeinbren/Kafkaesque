<script lang="ts">
import { onMount } from "svelte";
import { ArrowUp } from "lucide-svelte";
import { scale } from "svelte/transition";

let showButton = false;
let mounted = false;

function handleScroll() {
	showButton = window.scrollY > 400;
}

function scrollToTop() {
	window.scrollTo({
		top: 0,
		behavior: "smooth",
	});
}

onMount(() => {
	mounted = true;
	window.addEventListener("scroll", handleScroll);
	handleScroll();

	return () => {
		window.removeEventListener("scroll", handleScroll);
	};
});
</script>

{#if mounted && showButton}
	<button
		on:click={scrollToTop}
		transition:scale={{ duration: 200 }}
		class="fixed bottom-6 right-6 p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 z-40"
		aria-label="Back to top"
	>
		<ArrowUp class="w-5 h-5" />
	</button>
{/if}