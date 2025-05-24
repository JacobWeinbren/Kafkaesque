<script lang="ts">
import BlogPosts from "$lib/components/blog/BlogPosts.svelte";
import Newsletter from "$lib/components/blog/Newsletter.svelte";
import type { PageData } from "./$types";

export let data: PageData;
</script>

<svelte:head>
	<title>Blog – Jacob Weinbren</title>
	<meta
		name="description"
		content="Articles on GIS, spatial data science, web development, and electoral analysis by Jacob Weinbren."
	/>
	{#if data.url}
		<link rel="canonical" href={data.url.href} />
		<meta property="og:url" content={data.url.href} />
	{/if}
	<meta property="og:title" content="Blog – Jacob Weinbren" />
	<meta
		property="og:description"
		content="Articles on GIS, spatial data science, web development, and electoral analysis."
	/>
	<meta property="og:type" content="website" />
</svelte:head>

<!-- Hero Section -->
<section class="relative overflow-hidden section">
	<div class="absolute inset-0 bg-gradient-to-br from-emerald-800 via-emerald-700 to-emerald-600"></div>
	<div
		class="absolute inset-0 opacity-10"
		style="background-image: url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.2\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"
	></div>
	
	<div class="relative max-w-6xl mx-auto section-padding">
		<div class="max-w-4xl">
			<h1 class="text-4xl md:text-5xl font-bold text-white mb-6 font-display">
				Blog
			</h1>
			<p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-3xl">
				Insights on GIS, spatial data science, web development, and electoral analysis. 
				Sharing knowledge from academic research and practical projects.
			</p>
		</div>
	</div>
</section>

<!-- Blog Posts -->
<section class="section">
	<div class="max-w-6xl mx-auto section-padding">
		<BlogPosts />
	</div>
</section>

<!-- Newsletter -->
<section class="section bg-slate-50 dark:bg-slate-900">
	<div class="max-w-4xl mx-auto section-padding">
		<Newsletter />
	</div>
</section>