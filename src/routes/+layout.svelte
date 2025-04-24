<script lang="ts">
	import { onMount } from "svelte";
	import Navbar from "$lib/components/layout/Navbar.svelte";
	import Footer from "$lib/components/layout/Footer.svelte";
	import { ArrowUp } from "lucide-svelte";
	import type { LayoutData } from "./$types";
	import "../app.css";
	import { page } from "$app/stores"; // Import the page store

	export let data: LayoutData; // Expects { url: { href, pathname, origin } }

	// --- Default Meta Values ---
	const defaultOgImage = "https://kafkaesque.blog/img/logo_white.png";
	const defaultTitle =
		"Jacob Weinbren | GIS Specialist & Full-Stack Developer";
	const defaultDescription =
		"Specialising in geospatial data visualisation and full-stack web development.";

	// --- Determine if we are on a post page using the route ID ---
	let isPostPage = false;
	$: isPostPage = $page.route.id === "/post/[slug]";

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
		handleScroll();
		return () => window.removeEventListener("scroll", handleScroll);
	});

	// --- Logging ---
	console.log("[+layout.svelte] Received data:", data);
	$: console.log(
		"[+layout.svelte] Current route ID:",
		$page.route.id,
		" | Is Post Page:",
		isPostPage
	);
</script>

<svelte:head>
	<!-- Site-wide defaults - Title/Desc are overridden by page -->
	<!-- Image/OG/Twitter tags are conditional -->
	<title>{defaultTitle}</title>
	<meta name="description" content={defaultDescription} />

	{#if data.url?.href}
		<link rel="canonical" href={data.url.href} />
		<meta property="og:url" content={data.url.href} />
	{/if}

	<!-- Default OG Type -->
	<meta property="og:type" content="website" />

	<!-- *** Conditionally render default OG/Twitter tags *** -->
	{#if !isPostPage}
		<!-- Only render these if NOT on a post page -->

		<!-- Default OG Title/Description -->
		<meta property="og:title" content={defaultTitle} />
		<meta property="og:description" content={defaultDescription} />

		<!-- Default OG Image -->
		<meta property="og:image" content={defaultOgImage} />
		<meta property="og:image:secure_url" content={defaultOgImage} />
		<meta property="og:image:type" content="image/png" />
		<meta property="og:image:width" content="1200" />
		<meta property="og:image:height" content="630" />

		<!-- Default Twitter Card -->
		<meta name="twitter:card" content="summary_large_image" />
		<meta name="twitter:image" content={defaultOgImage} />
		<meta name="twitter:title" content={defaultTitle} />
		<meta name="twitter:description" content={defaultDescription} />
	{/if}
	<!-- If it *is* a post page, this block is skipped, leaving the responsibility -->
	<!-- entirely to the +page.svelte component for OG/Twitter title, desc, image. -->
</svelte:head>

<div class="min-h-screen flex flex-col bg-slate-50 antialiased">
	<Navbar currentPathname={data.url?.pathname ?? ""} />
	<main class="flex-grow">
		<slot />
	</main>
	<Footer />
	{#if showBackToTop}
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
