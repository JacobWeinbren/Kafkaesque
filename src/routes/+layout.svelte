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
	const defaultOgImage = "https://kafkaesque.blog/img/logo_white.png"; // Or your preferred default
	const defaultTitle =
		"Jacob Weinbren | GIS Specialist & Full-Stack Developer";
	const defaultDescription =
		"Specialising in geospatial data visualisation and full-stack web development.";

	// --- Determine if we are on a post page using the route ID ---
	// This is generally more reliable than regex on pathname
	let isPostPage = false;
	// Use reactive statement to update when the page store changes
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
	// Log the reactive check whenever $page.route.id changes
	$: console.log(
		"[+layout.svelte] Current route ID:",
		$page.route.id,
		" | Is Post Page:",
		isPostPage
	);
</script>

<svelte:head>
	<!-- Site-wide defaults - Render title/desc always, images conditionally -->
	<!-- These title/description tags will still be overridden by the page if the page defines them -->
	<title>{defaultTitle}</title>
	<meta name="description" content={defaultDescription} />

	{#if data.url?.href}
		<link rel="canonical" href={data.url.href} />
		<meta property="og:url" content={data.url.href} />
	{/if}

	<meta property="og:title" content={defaultTitle} />
	<meta property="og:description" content={defaultDescription} />
	<meta property="og:type" content="website" />

	<!-- *** Conditionally render default image tags *** -->
	{#if !isPostPage}
		<!-- Only render these if NOT on a post page -->
		<meta property="og:image" content={defaultOgImage} />
		<meta property="og:image:secure_url" content={defaultOgImage} />
		<meta property="og:image:type" content="image/png" />
		<meta property="og:image:width" content="1200" />
		<meta property="og:image:height" content="630" />

		<meta name="twitter:card" content="summary_large_image" />
		<meta name="twitter:image" content={defaultOgImage} />
		<!-- Also conditionally render default twitter title/desc if page should override -->
		<meta name="twitter:title" content={defaultTitle} />
		<meta name="twitter:description" content={defaultDescription} />
	{/if}
	<!-- If it *is* a post page, this block is skipped, leaving the responsibility -->
	<!-- entirely to the +page.svelte component for these specific tags. -->
</svelte:head>

<div class="min-h-screen flex flex-col bg-slate-50 antialiased">
	<!-- Pass only the pathname needed by Navbar -->
	<Navbar currentPathname={data.url?.pathname ?? ""} />

	<main class="flex-grow">
		<!-- Child pages will render here. Their <svelte:head> will merge with/override -->
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
