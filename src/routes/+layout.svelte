<script lang="ts">
import { onMount } from "svelte";
import { browser } from "$app/environment";
import Navbar from "$lib/components/layout/Navbar.svelte";
import Footer from "$lib/components/layout/Footer.svelte";
import BackToTop from "$lib/components/ui/BackToTop.svelte";
import ScrollProgress from "$lib/components/ui/ScrollProgress.svelte";
import type { LayoutData } from "./$types";
import "../app.css";
import { page } from "$app/stores";

export let data: LayoutData;

// Simple theme management
let darkMode = false;
let mounted = false;

// Initialize theme
onMount(() => {
	mounted = true;

	// Get initial theme from localStorage or system preference
	const stored = localStorage.getItem("theme");
	const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
	darkMode = stored === "dark" || (!stored && systemDark);

	// Apply theme immediately
	updateTheme();

	// Listen for system theme changes
	const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
	const handleSystemThemeChange = (e: MediaQueryListEvent) => {
		if (!localStorage.getItem("theme")) {
			darkMode = e.matches;
			updateTheme();
		}
	};

	mediaQuery.addEventListener("change", handleSystemThemeChange);

	return () => {
		mediaQuery.removeEventListener("change", handleSystemThemeChange);
	};
});

function updateTheme() {
	if (darkMode) {
		document.documentElement.classList.add("dark");
	} else {
		document.documentElement.classList.remove("dark");
	}
}

// Toggle theme function
function toggleTheme() {
	darkMode = !darkMode;

	if (browser) {
		localStorage.setItem("theme", darkMode ? "dark" : "light");
		updateTheme();
	}
}

// Determine if we are on a post page
$: isPostPage = $page.route.id === "/post/[slug]";

// Default meta values
const defaultOgImage = "https://jacobweinbren.com/og-image.png";
const defaultTitle = "Jacob Weinbren | GIS Specialist & Full-Stack Developer";
const defaultDescription =
	"GIS specialist and full-stack developer creating innovative mapping solutions and spatial data visualisations.";
</script>

<svelte:head>
	<title>{defaultTitle}</title>
	
	{#if data.url?.href}
		<link rel="canonical" href={data.url.href} />
		<meta property="og:url" content={data.url.href} />
	{/if}

	<meta property="og:type" content="website" />

	{#if !isPostPage}
		<meta name="description" content={defaultDescription} />
		<meta property="og:title" content={defaultTitle} />
		<meta property="og:description" content={defaultDescription} />
		<meta property="og:image" content={defaultOgImage} />
		<meta property="og:image:secure_url" content={defaultOgImage} />
		<meta property="og:image:type" content="image/png" />
		<meta property="og:image:width" content="1200" />
		<meta property="og:image:height" content="630" />
		<meta name="twitter:card" content="summary_large_image" />
		<meta name="twitter:image" content={defaultOgImage} />
		<meta name="twitter:title" content={defaultTitle} />
		<meta name="twitter:description" content={defaultDescription} />
	{/if}
</svelte:head>

<div class="min-h-screen flex flex-col bg-white dark:bg-slate-950 antialiased transition-colors duration-300">
	<!-- Scroll progress indicator -->
	{#if mounted}
		<ScrollProgress />
	{/if}

	<!-- Navigation -->
	<Navbar currentPathname={data.url?.pathname ?? ""} {darkMode} {toggleTheme} />

	<!-- Main content -->
	<main class="flex-grow">
		<slot />
	</main>

	<!-- Footer -->
	<Footer />

	<!-- Back to top button -->
	{#if mounted}
		<BackToTop />
	{/if}
</div>