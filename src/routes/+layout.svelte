<script lang="ts">
	import { onMount } from "svelte";
	import Navbar from "$lib/components/layout/Navbar.svelte";
	import Footer from "$lib/components/layout/Footer.svelte";
	import { ArrowUp } from "lucide-svelte"; // Using Lucide now
	import type { LayoutData } from "./$types";
	import "../app.css";

	let showBackToTop = false;
	function handleScroll() {
		showBackToTop = window.scrollY > 300;
	}
	function scrollToTop() {
		window.scrollTo({ top: 0, behavior: "smooth" });
	}
	onMount(() => {
		window.addEventListener("scroll", handleScroll);
		handleScroll();
		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	});

	export let data: LayoutData;
</script>

<div class="min-h-screen flex flex-col bg-gray-50">
	<Navbar currentPathname={data.url.pathname} />

	<main class="flex-grow">
		<!-- Child pages can override meta tags set in the layout's head -->
		<slot />
	</main>

	<Footer />

	<button
		id="backToTop"
		class="{showBackToTop
			? 'opacity-100 pointer-events-auto'
			: 'opacity-0 pointer-events-none'} fixed bottom-5 right-5 bg-green-700 text-white p-2 rounded-md shadow transition-opacity duration-300 hover:bg-green-800 focus:outline-hidden focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
		aria-label="Back to top"
		on:click={scrollToTop}
	>
		<ArrowUp class="h-5 w-5" />
	</button>
</div>
