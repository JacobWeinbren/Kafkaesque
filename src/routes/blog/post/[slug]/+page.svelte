<script lang="ts">
	// Import PageData type for this route's data
	import type { PageData } from "./$types";
	// Import necessary helpers/components
	import SignupForm from "$lib/components/blog/SignupForm.svelte";
	import { formatDate } from "$lib/utils/helpers";
	// Import the correct icon from lucide-svelte
	import { ChevronLeft } from "lucide-svelte";
	// Import the HashnodePost type if needed (already present)
	import type { HashnodePost } from "$lib/server/hashnode";
	import { onMount } from "svelte"; // Keep onMount if used elsewhere

	// Use PageData type for the data prop
	export let data: PageData;
	// Destructure post from data (data.post is defined by +page.server.ts)
	// Add a check in case post is somehow undefined, though error() should prevent this
	const post = data.post as HashnodePost; // Assert type if confident it exists

	// Construct the image proxy URL if a cover image exists
	const coverImageUrl = post?.coverImage?.src
		? `/api/image-proxy?url=${encodeURIComponent(post.coverImage.src)}`
		: null;

	// OG Image URL - use data.url from layout data, provide fallback
	const ogImageUrl =
		post?.coverImage?.src ||
		(data.url
			? `${data.url.origin}/default-og-image.png`
			: "/default-og-image.png");

	// Optional: Log received data
	onMount(() => {
		console.log("+page.svelte received data:", data);
		if (!post) console.error("Post data is missing!");
	});
</script>

<svelte:head>
	<title>{post?.title || "Blog Post"}</title>
	<meta
		name="description"
		content={post?.subtitle || post?.brief || "Read this blog post."}
	/>
	{#if data.url}
		<link rel="canonical" href={data.url.href} />
		<meta property="og:url" content={data.url.href} />
	{/if}
	<meta property="og:title" content={post?.title || "Blog Post"} />
	<meta
		property="og:description"
		content={post?.subtitle || post?.brief || "Read this blog post."}
	/>
	<meta property="og:type" content="article" />
	<meta property="og:image" content={ogImageUrl} />
	{#if post?.publishedAt}
		<meta property="article:published_time" content={post.publishedAt} />
	{/if}
	{#if post?.tags?.length > 0}
		{#each post.tags as tag}
			<meta property="article:tag" content={tag.name} />
		{/each}
	{/if}
	<meta name="twitter:card" content="summary_large_image" />
	<meta property="twitter:image" content={ogImageUrl} />
</svelte:head>

{#if post}
	<article class="max-w-3xl mx-auto px-4 py-8">
		<!-- Optimized Cover Image via Proxy -->
		{#if coverImageUrl}
			<div class="mb-8 overflow-hidden rounded-lg shadow-md bg-gray-100">
				<img
					src={coverImageUrl}
					alt={post.title}
					width="896"
					height="504"
					class="w-full h-auto object-cover aspect-[16/9]"
					loading="eager"
					decoding="async"
					fetchpriority="high"
				/>
			</div>
		{/if}

		<!-- Header -->
		<header class="mb-8">
			<time
				class="text-green-700 text-sm font-medium"
				datetime={post.publishedAt}
			>
				{formatDate(post.publishedAt)}
			</time>
			<h1
				class="text-3xl md:text-4xl font-bold mt-2 mb-3 font-display text-gray-900"
			>
				{post.title}
			</h1>
			{#if post.subtitle}
				<p class="text-lg text-gray-600">{post.subtitle}</p>
			{/if}
			{#if post.tags?.length > 0}
				<div class="flex flex-wrap gap-2 mt-4">
					{#each post.tags as tag (tag.slug)}
						<span
							class="bg-green-50 text-green-700 px-2 py-1 rounded-md text-xs font-medium"
						>
							{tag.name}
						</span>
					{/each}
				</div>
			{/if}
		</header>

		<!-- Content -->
		{#if post.content}
			<div class="prose prose-custom max-w-none">
				{@html post.content}
			</div>
		{:else}
			<p class="text-gray-500 italic">
				Post content could not be loaded.
			</p>
		{/if}

		<!-- Signup Form -->
		<div class="mt-10 border-t pt-8">
			<SignupForm />
		</div>

		<!-- Back Link -->
		<div class="mt-6 text-center">
			<a
				href="/blog"
				class="inline-flex items-center text-green-700 hover:text-green-800 transition text-sm"
			>
				<!-- Render icon directly -->
				<ChevronLeft class="w-4 h-4 mr-1" />
				Back to Blog
			</a>
		</div>
	</article>
{:else}
	<!-- Optional: Show a loading state or error if post data is missing -->
	<p class="text-center py-10 text-red-600">
		Error: Post data not available.
	</p>
{/if}
