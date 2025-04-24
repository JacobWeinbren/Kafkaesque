<script lang="ts">
	import { onMount } from "svelte";
	import Navbar from "$lib/components/layout/Navbar.svelte";
	import Footer from "$lib/components/layout/Footer.svelte";
	import { ArrowUp } from "lucide-svelte";
	import type { LayoutData } from "./$types";
	import "../app.css"; // Ensure global styles are imported

	export let data: LayoutData; // Comes from +layout.ts

	// --- Default Meta Values ---
	// Use the requested default image
	const defaultOgImage = "https://kafkaesque.blog/img/logo_white.png";
	const defaultTitle =
		"Jacob Weinbren | GIS Specialist & Full-Stack Developer";
	const defaultDescription =
		"Specialising in geospatial data visualisation and full-stack web development.";

	// --- Back to Top Button Logic ---
	let showBackToTop = false;
	function handleScroll() {
		showBackToTop = window.scrollY > 300;
	}
	function scrollToTop() {
		window.scrollTo({ top: 0, behavior: "smooth" });
	}
	onMount(() => {
		window.addEventListener("scroll", handleScroll);
		handleScroll(); // Initial check
		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	});
</script>

<svelte:head>
	<!-- Site-wide defaults - These can be overridden by child pages/layouts -->
	<title>{defaultTitle}</title>
	<meta name="description" content={defaultDescription} />

	{#if data.url}
		<!-- Use canonical and og:url from data passed by load function -->
		<link rel="canonical" href={data.url.href} />
		<meta property="og:url" content={data.url.href} />
	{/if}

	<meta property="og:title" content={defaultTitle} />
	<meta property="og:description" content={defaultDescription} />
	<meta property="og:type" content="website" />

	<!-- Default Image for OG and Twitter -->
	<meta property="og:image" content={defaultOgImage} />
	<meta property="og:image:secure_url" content={defaultOgImage} />
	<meta property="og:image:type" content="image/png" />
	<!-- You might know the dimensions of your logo -->
	<meta property="og:image:width" content="1200" />
	<!-- Adjust if needed -->
	<meta property="og:image:height" content="630" />
	<!-- Adjust if needed -->

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:image" content={defaultOgImage} />
	<!-- Optional: Add Twitter site handle if you have one -->
	<!-- <meta name="twitter:site" content="@yourTwitterHandle"> -->
</svelte:head>

<div class="min-h-screen flex flex-col bg-slate-50 antialiased">
	<Navbar currentPathname={data.url.pathname} />

	<main class="flex-grow">
		<!-- Child pages will render here. Their <svelte:head> will merge with/override the layout's -->
		<slot />
	</main>

	<Footer />

	{#if showBackToTop}
		<!-- Use transition for smoother appearance/disappearance -->
		<button
			id="backToTop"
			class="fixed bottom-5 right-5 bg-green-700 text-white p-2 rounded-md shadow-lg transition-opacity duration-300 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
			aria-label="Back to top"
			on:click={scrollToTop}
		>
			<ArrowUp class="h-5 w-5" />
		</button>
	{/if}
</div>
