<script lang="ts">
import type { PageData } from "./$types";
import SearchBox from "$lib/components/blog/Search.svelte";

export let data: PageData;
</script>

<svelte:head>
	<title>Search – Jacob Weinbren</title>
	<meta
		name="description"
		content="Search through my articles and projects."
	/>
	{#if data.url}
		<link rel="canonical" href={data.url.href} />
		<meta property="og:url" content={data.url.href} />
	{/if}
	<meta property="og:title" content="Search – Jacob Weinbren" />
	<meta
		property="og:description"
		content="Search through my articles and projects."
	/>
	<meta property="og:type" content="website" />
</svelte:head>

<section class="relative overflow-hidden section">
	<div
		class="absolute inset-0 bg-gradient-to-br from-emerald-800 via-emerald-700 to-emerald-600"
	></div>
	<div
		class="absolute inset-0 opacity-10"
		style="background-image: url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.2\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"
	></div>
	<div class="relative max-w-5xl mx-auto px-4 py-16 text-center">
		<h1 class="text-4xl md:text-5xl font-bold text-white mb-3 font-display">
			Search
		</h1>
		<p class="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
			Search keywords to explore my blog posts, projects and more
		</p>
	</div>
</section>

<section class="py-16">
	<div class="max-w-4xl mx-auto px-4">
		<div
			class="card p-6 sm:p-8 shadow-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl"
		>
			<SearchBox />
		</div>
	</div>
</section>