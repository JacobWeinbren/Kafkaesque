<script lang="ts">
	import { onMount } from "svelte";
	import { fade } from "svelte/transition";
	import { formatDate } from "$lib/utils/helpers";
	import CalendarIcon from "lucide-svelte/icons/calendar";
	import ClockIcon from "lucide-svelte/icons/clock";
	import TagIcon from "lucide-svelte/icons/tag";
	import ArrowLeftIcon from "lucide-svelte/icons/arrow-left";
	import TwitterIcon from "lucide-svelte/icons/twitter";
	import LinkedinIcon from "lucide-svelte/icons/linkedin";
	import LinkIcon from "lucide-svelte/icons/link";
	import Newsletter from "$lib/components/blog/Newsletter.svelte";
	import type { PageData } from "./$types";

	export let data: PageData;

	let mounted = false;
	let copied = false;

	onMount(() => {
		mounted = true;
	});

	$: post = data.post;
	$: ogImageUrl = post?.coverImage?.src
		? `/api/image?url=${encodeURIComponent(post.coverImage.src)}&w=1200&h=630&q=80`
		: "https://jacobweinbren.com/og-image.png";

	function copyLink() {
		navigator.clipboard.writeText(window.location.href);
		copied = true;
		setTimeout(() => {
			copied = false;
		}, 2000);
	}

	function shareOnTwitter() {
		const text = `${post.title} by @JacobWeinbren`;
		const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`;
		window.open(url, "_blank");
	}

	function shareOnLinkedIn() {
		const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
		window.open(url, "_blank");
	}
</script>

<svelte:head>
	<title>{post.title} – Jacob Weinbren</title>
	<meta
		name="description"
		content={post.subtitle || post.brief || "Article by Jacob Weinbren"}
	/>

	{#if data.url}
		<link rel="canonical" href={data.url.href} />
		<meta property="og:url" content={data.url.href} />
	{/if}

	<meta property="og:type" content="article" />
	<meta property="og:title" content={post.title} />
	<meta
		property="og:description"
		content={post.subtitle || post.brief || "Article by Jacob Weinbren"}
	/>
	<meta property="og:image" content={ogImageUrl} />
	<meta property="og:image:secure_url" content={ogImageUrl} />
	<meta property="og:image:type" content="image/jpeg" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:image" content={ogImageUrl} />
	<meta name="twitter:title" content={post.title} />
	<meta
		name="twitter:description"
		content={post.subtitle || post.brief || "Article by Jacob Weinbren"}
	/>
	<meta name="twitter:creator" content="@JacobWeinbren" />

	<meta property="article:published_time" content={post.publishedAt} />
	<meta property="article:author" content="Jacob Weinbren" />

	{#each post.tags as tag}
		<meta property="article:tag" content={tag.name} />
	{/each}
</svelte:head>

<article class="min-h-screen">
	<!-- Header -->
	<header class="section">
		<div class="max-w-4xl mx-auto section-padding">
			{#if mounted}
				<div in:fade={{ duration: 400, delay: 200 }}>
					<div class="mb-8">
						<a
							href="/blog"
							class="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition-colors duration-200"
						>
							<ArrowLeftIcon class="w-4 h-4" />
							Back to Blog
						</a>
					</div>

					<!-- Cover Image -->
					{#if post.coverImage?.src}
						<div
							class="relative aspect-video overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 mb-8"
						>
							<img
								src={`/api/image?url=${encodeURIComponent(post.coverImage.src)}&w=1200&h=630&q=80`}
								alt={post.title}
								class="w-full h-full object-cover"
								loading="eager"
								fetchpriority="high"
							/>
						</div>
					{/if}

					<!-- Meta -->
					<div
						class="flex flex-wrap items-center gap-4 text-slate-600 dark:text-slate-400 text-sm mb-6"
					>
						<div class="flex items-center gap-2">
							<CalendarIcon class="w-4 h-4" />
							<time datetime={post.publishedAt}>
								{formatDate(post.publishedAt)}
							</time>
						</div>
						<div class="flex items-center gap-2">
							<ClockIcon class="w-4 h-4" />
							<span
								>{Math.ceil(
									(post.content?.length || 1000) / 1000
								)} min read</span
							>
						</div>
					</div>

					<!-- Title -->
					<h1
						class="text-3xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4 font-display leading-tight"
					>
						{post.title}
					</h1>

					<!-- Subtitle -->
					{#if post.subtitle}
						<p
							class="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed mb-6"
						>
							{post.subtitle}
						</p>
					{/if}

					<!-- Tags -->
					{#if post.tags && post.tags.length > 0}
						<div class="flex flex-wrap gap-2 mb-8">
							{#each post.tags as tag}
								<span
									class="inline-flex items-center gap-1 badge badge-secondary"
								>
									<TagIcon class="w-3 h-3" />
									{tag.name}
								</span>
							{/each}
						</div>
					{/if}

					<!-- Share Buttons -->
					<div
						class="flex items-center gap-3 mb-8 pb-8 border-b border-slate-200 dark:border-slate-700"
					>
						<span
							class="text-slate-600 dark:text-slate-400 text-sm font-medium"
							>Share:</span
						>
						<button
							on:click={copyLink}
							class="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
							title="Copy link"
						>
							<LinkIcon class="w-4 h-4" />
						</button>
						<button
							on:click={shareOnTwitter}
							class="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
							title="Share on Twitter"
						>
							<TwitterIcon class="w-4 h-4" />
						</button>
						<button
							on:click={shareOnLinkedIn}
							class="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
							title="Share on LinkedIn"
						>
							<LinkedinIcon class="w-4 h-4" />
						</button>
						{#if copied}
							<span
								class="text-emerald-600 dark:text-emerald-400 text-sm"
								>Copied!</span
							>
						{/if}
					</div>
				</div>
			{/if}
		</div>
	</header>

	<!-- Content -->
	<section class="pb-16">
		<div class="max-w-4xl mx-auto section-padding">
			{#if mounted}
				<div
					in:fade={{ duration: 400, delay: 300 }}
					class="prose prose-lg"
				>
					{@html post.content}
				</div>
			{/if}
		</div>
	</section>

	<!-- Newsletter -->
	<section class="section bg-slate-50 dark:bg-slate-900">
		<div class="max-w-4xl mx-auto section-padding">
			<Newsletter />
		</div>
	</section>
</article>
