<!-- src/routes/post/[slug]/+page.svelte -->
<script lang="ts">
	import type { PageData } from "./$types";
	import SignupForm from "$lib/components/blog/SignupForm.svelte";
	import { formatDate } from "$lib/utils/helpers";
	import { ChevronLeft } from "lucide-svelte";
	import type { HashnodePost } from "$lib/server/hashnode";
	import { onMount } from "svelte";

	export let data: PageData; // Contains post data and url from load functions
	const post = data.post as HashnodePost; // Asserting type as load function handles errors

	// --- Image URLs ---
	// Define the default image URL (MUST be absolute)
	const defaultOgImage = `${data.url.origin}/img/logo_white.webp`; // Ensure this path is correct and publicly accessible

	// Base URL needed for absolute paths (comes from +layout.ts -> LayoutData)
	const baseUrl = data.url.origin; // e.g., "https://kafkaesque.blog"

	// URL for the image displayed *within* the post body (can be relative)
	const coverImageUrl = post?.coverImage?.src
		? `/api/image?url=${encodeURIComponent(post.coverImage.src)}&w=1200&q=80`
		: null;

	// --- ABSOLUTE URL for the preview image (og:image, twitter:image) ---
	// Use the post's cover image (via API) if available, otherwise use the default logo.
	// CRITICAL: Prepend baseUrl to the API path to make it absolute.
	const ogImageUrl = post?.coverImage?.src
		? `${baseUrl}/api/image?url=${encodeURIComponent(post.coverImage.src)}&w=1200&q=80` // ABSOLUTE URL
		: defaultOgImage; // Default is already absolute

	// --- Post Metadata ---
	const postTitle = post?.title ?? "Blog Post";
	const postDescription =
		post?.subtitle || post?.brief || "Read this blog post.";
	const postPublishedAt = post?.publishedAt;

	// --- Debugging ---
	onMount(() => {
		if (!post) {
			console.error(
				"[+page.svelte] Post data is missing! Check load function."
			);
		}
		console.log("[+page.svelte] Rendering post:", postTitle);
		console.log("[+page.svelte] Base URL:", baseUrl);
		console.log(
			"[+page.svelte] Determined ABSOLUTE OG Image URL:",
			ogImageUrl
		);
	});
</script>

<svelte:head>
	<!-- Override layout defaults with post-specific information -->
	<title>{postTitle}</title>
	<meta name="description" content={postDescription} />

	<!-- Canonical and OG URL are inherited from layout via data.url -->

	<!-- Open Graph Tags -->
	<meta property="og:title" content={postTitle} />
	<meta property="og:description" content={postDescription} />
	<meta property="og:type" content="article" />
	<meta property="og:image" content={ogImageUrl} />
	{#if ogImageUrl.startsWith("https")}
		<meta property="og:image:secure_url" content={ogImageUrl} />
	{/if}
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<!-- Assuming API aims for ~1.91:1 ratio -->
	{#if ogImageUrl.includes(".png") || ogImageUrl.endsWith(".png")}
		<meta property="og:image:type" content="image/png" />
	{:else if ogImageUrl.includes(".jpg") || ogImageUrl.includes(".jpeg") || ogImageUrl.endsWith(".jpg") || ogImageUrl.endsWith(".jpeg")}
		<meta property="og:image:type" content="image/jpeg" />
	{:else if ogImageUrl.includes(".webp") || ogImageUrl.endsWith(".webp")}
		<meta property="og:image:type" content="image/webp" />
	{/if}

	<!-- Twitter Card Tags -->
	<meta name="twitter:card" content="summary_large_image" />
	<!-- Explicitly set Twitter title and description -->
	<meta name="twitter:title" content={postTitle} />
	<meta name="twitter:description" content={postDescription} />
	<meta name="twitter:image" content={ogImageUrl} />
	<!-- Optional: Add Twitter site/creator handles if applicable -->
	<!-- <meta name="twitter:site" content="@YourSiteHandle"> -->
	<!-- <meta name="twitter:creator" content="@AuthorHandle"> -->

	<!-- Article Specific Tags -->
	{#if postPublishedAt}
		<meta property="article:published_time" content={postPublishedAt} />
	{/if}
	{#if post?.tags?.length > 0}
		{#each post.tags as tag (tag.slug)}
			<meta property="article:tag" content={tag.name} />
		{/each}
	{/if}
</svelte:head>

<!-- Rest of the component remains the same -->

{#if post}
	<article class="max-w-3xl mx-auto px-4 py-8">
		{#if coverImageUrl}
			<div class="mb-8 overflow-hidden rounded-lg shadow bg-gray-100">
				<img
					src={coverImageUrl}
					alt={post.title ?? "Cover Image"}
					width="896"
					height="504"
					class="w-full h-auto object-cover aspect-[16/9]"
					loading="eager"
					decoding="async"
					fetchpriority="high"
				/>
			</div>
		{/if}

		<header class="mb-8">
			<time
				class="text-green-700 text-sm font-medium block mb-1"
				datetime={postPublishedAt || undefined}
			>
				{#if postPublishedAt}
					{formatDate(postPublishedAt)}
				{:else}
					<span class="text-gray-500 italic">Date Unavailable</span>
				{/if}
			</time>
			<h1
				class="text-3xl md:text-4xl font-bold mt-1 mb-3 font-display text-gray-900"
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

		{#if post.content && post.content.trim() !== ""}
			<div class="prose prose-custom max-w-none">
				{@html post.content}
			</div>
		{:else}
			<p class="text-gray-500 italic my-6">
				Post content is empty or could not be loaded.
			</p>
		{/if}

		<div class="mt-10 border-t pt-8">
			<SignupForm />
		</div>

		<div class="mt-8 text-center">
			<a
				href="/blog"
				class="inline-flex items-center text-green-700 hover:text-green-800 transition text-sm font-medium"
			>
				<ChevronLeft class="w-4 h-4 mr-1" />
				Back to Blog
			</a>
		</div>
	</article>
{:else}
	<div class="text-center py-16 px-4">
		<h1 class="text-2xl font-bold text-red-600 mb-4">Error Loading Post</h1>
		<p class="text-gray-600">
			The requested blog post could not be loaded. Please try again later
			or return to the blog index.
		</p>
		<a
			href="/blog"
			class="mt-6 inline-flex items-center text-green-700 hover:text-green-800 transition text-sm font-medium"
		>
			<ChevronLeft class="w-4 h-4 mr-1" />
			Back to Blog
		</a>
	</div>
{/if}
