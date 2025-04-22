<script lang="ts">
	import { Home, Archive, FileText, Search, Menu, X } from "lucide-svelte";
	import { slide, fade } from "svelte/transition";
	import { quintOut } from "svelte/easing";

	export let currentPathname: string;

	import type { ComponentType } from "svelte";
	interface NavLink {
		href: string;
		text: string;
		Icon: ComponentType;
	}

	const links: NavLink[] = [
		{ href: "/", text: "Home", Icon: Home },
		{ href: "/portfolio", text: "Portfolio", Icon: Archive },
		{ href: "/blog", text: "Blog", Icon: FileText },
		{ href: "/search", text: "Search", Icon: Search },
	];

	let mobileMenuOpen = false;
	let scrolled = false;

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	// Track scrolling for navbar styling
	if (typeof window !== "undefined") {
		window.addEventListener("scroll", () => {
			scrolled = window.scrollY > 10;
		});
	}
</script>

<nav
	class="sticky top-0 z-50 transition duration-300 {scrolled
		? 'bg-white/95 backdrop-blur-sm shadow-md'
		: 'bg-transparent'}"
	aria-label="Main navigation"
>
	<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex items-center justify-between h-16">
			<a
				href="/"
				class="flex items-center font-display font-bold text-xl tracking-tight text-green-700 hover:text-green-600 transition duration-200"
			>
				<span class="sr-only">Jacob Weinbren</span>
				<svg
					viewBox="0 0 24 24"
					class="h-6 w-6 mr-2"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M9 20L3 17V4L9 7M9 20L15 17M9 20V7M15 17L21 20V7L15 4M15 17V4M9 7L15 4"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
				Jacob W
			</a>

			<!-- Desktop Menu -->
			<div class="hidden md:flex space-x-1">
				{#each links as { href, text, Icon }}
					{@const isActive =
						href === "/"
							? currentPathname === href
							: currentPathname.startsWith(href)}
					<a
						{href}
						class="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm text-slate-700 hover:text-green-700 hover:bg-green-50/50 transition-colors {isActive
							? 'bg-green-50/70 text-green-700 font-medium'
							: ''}"
						aria-current={isActive ? "page" : undefined}
					>
						<svelte:component this={Icon} class="w-4 h-4" />
						<span>{text}</span>
					</a>
				{/each}
			</div>

			<!-- Mobile Menu Button -->
			<div class="md:hidden">
				<button
					on:click={toggleMobileMenu}
					class="p-2 rounded-md text-slate-600 hover:bg-slate-100 hover:text-green-700 transition focus:outline-none focus:ring-2 focus:ring-green-500"
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
				transition:slide={{ duration: 300, easing: quintOut }}
				class="md:hidden pb-3 pt-2 absolute left-0 right-0 bg-white shadow-lg border-b border-slate-200 p-4"
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
							class="flex items-center gap-2 px-3 py-3 rounded-md text-slate-700 hover:bg-green-50/50 hover:text-green-700 transition-colors {isActive
								? 'bg-green-50 text-green-700 font-medium'
								: ''}"
							in:fade={{ delay: i * 50, duration: 200 }}
							aria-current={isActive ? "page" : undefined}
							on:click={() => (mobileMenuOpen = false)}
						>
							<svelte:component this={Icon} class="w-4 h-4" />
							<span>{text}</span>
						</a>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</nav>
