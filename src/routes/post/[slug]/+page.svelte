<!-- src/routes/post/[slug]/+page.svelte -->
<script lang="ts">
	// Import the layout data shape to merge it into PageData expectation
	import type { LayoutDataShape } from "../../+layout";
	import type { PageData as ServerPageData } from "./$types"; // Type from +page.server.ts
	import SignupForm from "$lib/components/blog/SignupForm.svelte";
	import { formatDate } from "$lib/utils/helpers";
	import { ChevronLeft } from "lucide-svelte";
	import type { HashnodePost } from "$lib/server/hashnode";
	import { onMount } from "svelte";

	// Define the combined data type expected by the page component
	type PageData = ServerPageData & LayoutDataShape;

	export let data: PageData; // Expects { post: ..., url: { ... } }

	// --- Derive page-specific values from MERGED data ---
	const post = data.post as HashnodePost;
	const baseUrl = data.url?.origin ?? "";

	// --- Page Specific Meta Values ---
	const postTitle = post?.title ?? "Blog Post";
	const postDescription =
		post?.subtitle || post?.brief || "Read this blog post.";
	const postUrl = data.url?.href ?? "";

	// --- Calculate OG Image URL ---
	const defaultOgImage = "https://kafkaesque.blog/img/logo_white.png";
	const ogImageUrl = post?.coverImage?.src
		? baseUrl
			? `${baseUrl}/api/image?url=${encodeURIComponent(post.coverImage.src)}&w=1200&q=80`
			: `/api/image?url=${encodeURIComponent(post.coverImage.src)}&w=1200&q=80`
		: defaultOgImage;

	// --- Calculate Secure URL Content ---
	const secureOgImageUrlContent = ogImageUrl.startsWith("https")
		? ogImageUrl
		: "";

	// Helper function to determine image type
	function getImageType(url: string): string {
		if (!url) return "image/png";
		const lowerUrl = url.toLowerCase();
		if (lowerUrl.endsWith(".png")) return "image/png";
		if (lowerUrl.endsWith(".jpg") || lowerUrl.endsWith(".jpeg"))
			return "image/jpeg";
		if (lowerUrl.endsWith(".webp")) return "image/webp";
		if (url.includes("/api/image")) return "image/jpeg";
		return "image/png";
	}
	const imageType = getImageType(ogImageUrl);

	// --- Image URL for content display ---
	const coverImageUrl = post?.coverImage?.src
		? `/api/image?url=${encodeURIComponent(post.coverImage.src)}&w=1200&q=80`
		: null;

	// --- Other Post Metadata ---
	const postPublishedAt = post?.publishedAt;

	onMount(() => {
		console.log("[+page.svelte] Received merged data:", data);
		console.log("[+page.svelte] Using OG Image URL:", ogImageUrl);
		console.log(
			"[+page.svelte] Secure OG Image URL Content:",
			secureOgImageUrlContent
		);
	});
</script>

<svelte:head>
	<!-- These tags will OVERRIDE the layout's title/description -->
	<!-- And they will be the *only* source for image/twitter tags on post pages -->

	<title>{postTitle}</title>
	<meta name="description" content={postDescription} />

	{#if postUrl}
		<link rel="canonical" href={postUrl} />
		<meta property="og:url" content={postUrl} />
	{/if}

	<meta property="og:title" content={postTitle} />
	<meta property="og:description" content={postDescription} />
	<meta property="og:type" content="article" />

	<!-- OG Image Block - Always Rendered -->
	<meta property="og:image" content={ogImageUrl} />
	<meta property="og:image:secure_url" content={secureOgImageUrlContent} />
	<meta property="og:image:type" content={imageType} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />

	<!-- Twitter Card Block - Always Rendered -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={postTitle} />
	<meta name="twitter:description" content={postDescription} />
	<meta name="twitter:image" content={ogImageUrl} />

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

<!-- Component Body (article, header, content, etc.) -->
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
	<!-- Fallback -->
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
