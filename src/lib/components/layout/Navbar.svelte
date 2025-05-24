<script lang="ts">
	import { onMount } from "svelte";
	import {
		Home,
		FileText,
		Search,
		Menu,
		X,
		Map as MapIcon,
		User,
	} from "lucide-svelte";
	import { slide, fade } from "svelte/transition";
	import { quintOut } from "svelte/easing";
	// @ts-ignore - ComponentType is deprecated but still the most compatible type for Lucide icons
	import type { ComponentType } from "svelte";

	export let currentPathname: string;

	interface NavLink {
		href: string;
		text: string;
		Icon: ComponentType;
	}

	const links: NavLink[] = [
		{ href: "/", text: "Home", Icon: Home },
		{ href: "/about", text: "About", Icon: User },
		{ href: "/blog", text: "Blog", Icon: FileText },
		{ href: "/search", text: "Search", Icon: Search },
	];

	let mobileMenuOpen = false;
	let scrolled = false;

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function handleScroll() {
		scrolled = window.scrollY > 10;
	}

	onMount(() => {
		window.addEventListener("scroll", handleScroll);
		handleScroll();
		return () => window.removeEventListener("scroll", handleScroll);
	});
</script>

<nav
	class="sticky top-0 z-50 transition-all duration-200 {scrolled
		? 'bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm shadow-sm border-b border-slate-200 dark:border-slate-800'
		: 'bg-white dark:bg-slate-950'}"
	aria-label="Main navigation"
>
	<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex items-center justify-between h-16">
			<!-- Logo -->
			<a
				href="/"
				class="flex items-center font-display font-semibold text-lg text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200"
			>
				<MapIcon
					class="h-5 w-5 mr-2 text-emerald-600 dark:text-emerald-400"
				/>
				Jacob Weinbren
			</a>

			<!-- Desktop Menu -->
			<div class="hidden md:flex items-center space-x-1">
				{#each links as { href, text, Icon }}
					{@const isActive =
						href === "/"
							? currentPathname === href
							: currentPathname.startsWith(href)}
					<a
						{href}
						class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 {isActive
							? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
							: 'text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800'}"
						aria-current={isActive ? "page" : undefined}
					>
						<svelte:component this={Icon} class="w-4 h-4" />
						<span>{text}</span>
					</a>
				{/each}
			</div>

			<!-- Mobile Menu Button -->
			<div class="md:hidden flex items-center gap-2">
				<button
					on:click={toggleMobileMenu}
					class="p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
					aria-label="Toggle menu"
					aria-expanded={mobileMenuOpen}
				>
					{#if mobileMenuOpen}
						<X class="w-5 h-5" />
					{:else}
						<Menu class="w-5 h-5" />
					{/if}
				</button>
			</div>
		</div>

		<!-- Mobile Menu -->
		{#if mobileMenuOpen}
			<div
				transition:slide={{ duration: 250, easing: quintOut }}
				class="md:hidden bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-4"
				role="navigation"
			>
				<div class="flex flex-col space-y-1">
					{#each links as { href, text, Icon }, i}
						{@const isActive =
							href === "/"
								? currentPathname === href
								: currentPathname.startsWith(href)}
						<a
							{href}
							class="flex items-center gap-3 px-3 py-3 rounded-lg font-medium transition-colors duration-200 {isActive
								? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
								: 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400'}"
							in:fade={{ delay: i * 50, duration: 150 }}
							aria-current={isActive ? "page" : undefined}
							on:click={() => (mobileMenuOpen = false)}
						>
							<svelte:component this={Icon} class="w-5 h-5" />
							<span>{text}</span>
						</a>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</nav>
