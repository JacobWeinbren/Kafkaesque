<!-- src/routes/post/[slug]/+page.svelte -->
<script lang="ts">
	import type { PageData } from "./$types";
	import SignupForm from "$lib/components/blog/SignupForm.svelte";
	import { formatDate } from "$lib/utils/helpers";
	import { ChevronLeft } from "lucide-svelte";
	import type { HashnodePost } from "$lib/server/hashnode";
	import { onMount } from "svelte";

	export let data: PageData;
	// The load function ensures post is valid if we reach here, so direct assertion is okay
	const post = data.post as HashnodePost;

	// URL for the image displayed *within* the post body (optimized)
	const coverImageUrl = post?.coverImage?.src
		? `/api/image?url=${encodeURIComponent(post.coverImage.src)}&w=1200&q=80`
		: null;

	// --- MODIFIED SECTION START ---
	// Define the default image URL
	const defaultOgImage = "https://kafkaesque.blog/img/logo_white.png";

	// URL for the preview image (og:image, twitter:image)
	// Use the optimized cover image if available, otherwise use the default logo
	const ogImageUrl = post?.coverImage?.src
		? `/api/image?url=${encodeURIComponent(post.coverImage.src)}&w=1200&q=80` // Use optimized version
		: defaultOgImage; // Fallback to the specified default logo
	// --- MODIFIED SECTION END ---

	// Use optional chaining and nullish coalescing for safety
	const postTitle = post?.title ?? "Blog Post"; // Fallback title
	const postDescription =
		post?.subtitle || post?.brief || "Read this blog post."; // Fallback description
	const postPublishedAt = post?.publishedAt; // Store raw value (might be "" from getPost)

	// Optional: Log received data on mount
	onMount(() => {
		// This check should ideally never fail if +page.server.ts works
		if (!post) console.error("[+page.svelte] Post data is missing!");
		// Log the date specifically
		console.log(
			"[+page.svelte] Rendering post:",
			postTitle,
			"PublishedAt:",
			postPublishedAt
		);
		// Log the determined OG image URL for debugging
		console.log("[+page.svelte] OG Image URL:", ogImageUrl);
	});
</script>

<svelte:head>
	<title>{postTitle}</title>
	<meta name="description" content={postDescription} />
	{#if data.url}
		<link rel="canonical" href={data.url.href} />
		<meta property="og:url" content={data.url.href} />
	{/if}
	<meta property="og:title" content={postTitle} />
	<meta property="og:description" content={postDescription} />
	<meta property="og:type" content="article" />
	<!-- Use the derived ogImageUrl for both OG and Twitter -->
	<meta property="og:image" content={ogImageUrl} />
	<!-- Optional: Add secure_url if your image API serves over HTTPS -->
	{#if ogImageUrl.startsWith("https")}
		<meta property="og:image:secure_url" content={ogImageUrl} />
	{/if}
	<!-- Optional: Add image dimensions if known (recommended: 1200x630) -->
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<!-- Optional: Add image type -->
	{#if ogImageUrl.endsWith(".png")}
		<meta property="og:image:type" content="image/png" />
	{:else if ogImageUrl.endsWith(".jpg") || ogImageUrl.endsWith(".jpeg")}
		<meta property="og:image:type" content="image/jpeg" />
	{:else if ogImageUrl.endsWith(".webp")}
		<meta property="og:image:type" content="image/webp" />
	{/if}

	<!-- Check postPublishedAt is a non-empty string before adding meta tag -->
	{#if postPublishedAt}
		<meta property="article:published_time" content={postPublishedAt} />
	{/if}
	{#if post?.tags?.length > 0}
		{#each post.tags as tag}
			<meta property="article:tag" content={tag.name} />
		{/each}
	{/if}
	<meta name="twitter:card" content="summary_large_image" />
	<meta property="twitter:image" content={ogImageUrl} />
	<!-- Optional: Add Twitter specific title/description if needed, often defaults to OG tags -->
	<!-- <meta name="twitter:title" content={postTitle}> -->
	<!-- <meta name="twitter:description" content={postDescription}> -->
</svelte:head>

<!-- Outer check should be redundant if load function works, but keep for safety -->
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
			<!-- Check postPublishedAt is a non-empty string before formatting -->
			<time
				class="text-green-700 text-sm font-medium"
				datetime={postPublishedAt || undefined}
			>
				{#if postPublishedAt}
					{formatDate(postPublishedAt)}
				{:else}
					<span class="text-gray-500 italic">Date Unavailable</span>
				{/if}
			</time>
			<h1
				class="text-3xl md:text-4xl font-bold mt-2 mb-3 font-display text-gray-900"
			>
				{post.title}
				<!-- Already has fallback via postTitle -->
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

		<!-- Content - Check if content string is non-empty -->
		{#if post.content && post.content.trim() !== ""}
			<div class="prose prose-custom max-w-none">
				{@html post.content}
			</div>
		{:else}
			<!-- This message now shows if content is null, undefined, or empty string -->
			<p class="text-gray-500 italic">
				Post content is empty or could not be loaded.
			</p>
		{/if}

		<div class="mt-10 border-t pt-8">
			<SignupForm />
		</div>

		<div class="mt-6 text-center">
			<a
				href="/blog"
				class="inline-flex items-center text-green-700 hover:text-green-800 transition text-sm"
			>
				<ChevronLeft class="w-4 h-4 mr-1" />
				Back to Blog
			</a>
		</div>
	</article>
{:else}
	<!-- This part should ideally never be reached if load function works -->
	<p class="text-center py-10 text-red-600">
		Error: Post data could not be loaded for rendering.
	</p>
{/if}
