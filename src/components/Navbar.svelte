<script>
	import { fade } from "svelte/transition";

	let isMenuOpen = false;
	const menuItems = [
		{ name: "About", url: "/about" },
		{ name: "Projects", url: "/projects" },
		{ name: "Blog", url: "/blog" },
		{ name: "Search", url: "/search" },
	];

	const toggleMenu = () => (isMenuOpen = !isMenuOpen);

	function slideOnly(node, { duration }) {
		return {
			duration,
			css: (t) => `
                transform: translateX(${t * 100 - 100}%);
            `,
		};
	}
</script>

<nav class="p-5 text-white bg-green-500 md:p-7 lg:p-11 flex justify-center">
	<div class="max-w-screen-lg w-full">
		<div class="container flex items-center justify-between mx-auto">
			<a href="/" class="text-xl font-bold">Jacob W</a>
			<button
				class="z-30 md:hidden"
				on:click={toggleMenu}
				aria-label="Toggle menu"
			>
				<div class="flex flex-col justify-between w-6 h-5">
					<span
						class="w-full h-0.5 bg-white rounded-full transition-all duration-300 ease-in-out"
						class:rotate-45={isMenuOpen}
						class:translate-y-[9px]={isMenuOpen}
					></span>
					<span
						class="w-full h-0.5 bg-white rounded-full transition-all duration-300 ease-in-out"
						class:opacity-0={isMenuOpen}
					></span>
					<span
						class="w-full h-0.5 bg-white rounded-full transition-all duration-300 ease-in-out"
						class:-rotate-45={isMenuOpen}
						class:-translate-y-[9px]={isMenuOpen}
					></span>
				</div>
			</button>
			<ul
				class="hidden space-x-6 md:flex md:space-x-8 lg:space-x-10 xl:space-x-12 md:px-6 lg:px-8 xl:px-11"
			>
				{#each menuItems as item}
					<li>
						<a href={item.url} class="hover:text-opacity-80"
							>{item.name}</a
						>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</nav>

{#if isMenuOpen}
	<div
		class="fixed inset-0 z-20 bg-black bg-opacity-30 md:hidden"
		transition:fade={{ duration: 200 }}
	></div>
	<div
		class="fixed inset-y-0 left-0 z-20 w-64 p-4 text-black bg-white dark:text-white dark:bg-gray-800 md:hidden"
		transition:slideOnly={{ duration: 200 }}
	>
		<a href="/" class="block mb-6 text-xl font-bold text-green-500"
			>Jacob W</a
		>
		<ul class="space-y-4">
			{#each menuItems as item}
				<li>
					<a
						href={item.url}
						class="hover:text-green-500 dark:hover:text-green-300"
						>{item.name}</a
					>
				</li>
			{/each}
		</ul>
	</div>
{/if}
