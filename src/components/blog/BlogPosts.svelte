<!-- src/components/blog/BlogPosts.svelte -->
<script context="module" lang="ts">
	// Move export of types to module context.
	export interface BlogPost {
		id: string;
		slug: string;
		title: string;
		subtitle: string;
		coverImage?: string | null;
		publishedAt: string;
	}
</script>

<script lang="ts">
	import { onMount } from "svelte";
	import { fade } from "svelte/transition";

	// These become component props
	export let initialPosts: BlogPost[] = [];
	export let initialHasMore: boolean;
	export let initialEndCursor: string;

	let posts: BlogPost[] = initialPosts;
	let currentCursor = initialEndCursor;
	let hasMore = initialHasMore;
	let loading = false;
	let loadMoreTrigger: HTMLDivElement;

	async function loadMorePosts() {
		if (loading || !hasMore) return;
		loading = true;
		try {
			const res = await fetch(
				`/api/posts?cursor=${encodeURIComponent(currentCursor)}`
			);
			if (!res.ok) throw new Error("Failed to load posts");
			const data = await res.json();
			if (data.posts && data.posts.length > 0) {
				posts = [...posts, ...data.posts];
				currentCursor = data.endCursor || "";
				hasMore = data.hasMore;
			}
		} catch (e) {
			console.error(e);
		} finally {
			loading = false;
		}
	}

	function setupObserver() {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting && hasMore && !loading) {
						loadMorePosts();
					}
				});
			},
			{ rootMargin: "200px" }
		);
		if (loadMoreTrigger) observer.observe(loadMoreTrigger);
	}

	onMount(() => {
		setupObserver();
	});
</script>

<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
	{#each posts as post, i (post.id)}
		<article
			in:fade={{ duration: 200, delay: (i % 3) * 80 }}
			class="group bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-all duration-300 h-full flex flex-col"
		>
			<a href={`/post/${post.slug}`} class="h-full flex flex-col">
				{#if post.coverImage}
					<div class="relative h-48 overflow-hidden bg-gray-100">
						<img
							src={post.coverImage}
							alt={post.title}
							class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
							loading="lazy"
							width="400"
							height="225"
							decoding="async"
						/>
						<div
							class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
						></div>
					</div>
				{/if}
				<div class="p-5 flex-grow flex flex-col">
					<time class="text-sm text-green-700 font-medium block mb-2">
						{new Date(post.publishedAt).toLocaleDateString(
							"en-GB",
							{
								day: "numeric",
								month: "long",
								year: "numeric",
							}
						)}
					</time>
					<h2
						class="text-lg font-display font-bold text-gray-900 mb-2 group-hover:text-green-700 transition"
					>
						{post.title}
					</h2>
					<p
						class="text-gray-600 text-sm line-clamp-2 mb-4 flex-grow"
					>
						{post.subtitle}
					</p>
					<div
						class="flex items-center text-green-700 text-sm font-medium mt-auto"
					>
						Read more
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							class="ml-1 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 5l7 7-7 7"
							/>
						</svg>
					</div>
				</div>
			</a>
		</article>
	{/each}
</div>

{#if loading}
	<div class="flex justify-center py-6">
		<div
			class="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-green-700"
		></div>
	</div>
{/if}

{#if !hasMore && posts.length > 0}
	<div class="text-center py-6 text-gray-500 border-t mt-8 pt-4">
		You've reached the end of the posts
	</div>
{/if}

<!-- Skeleton loader for posts -->
{#if loading && posts.length === 0}
	<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
		{#each Array(3) as _, i}
			<div
				class="bg-white rounded-lg overflow-hidden border border-gray-200 h-full"
			>
				<div class="h-48 bg-gray-100 animate-shimmer"></div>
				<div class="p-5">
					<div
						class="h-4 w-24 bg-gray-100 animate-shimmer mb-4 rounded"
					></div>
					<div
						class="h-5 w-full bg-gray-100 animate-shimmer mb-3 rounded"
					></div>
					<div
						class="h-5 w-3/4 bg-gray-100 animate-shimmer mb-4 rounded"
					></div>
					<div
						class="h-4 w-full bg-gray-100 animate-shimmer mb-2 rounded"
					></div>
					<div
						class="h-4 w-5/6 bg-gray-100 animate-shimmer mb-6 rounded"
					></div>
					<div
						class="h-4 w-20 bg-gray-100 animate-shimmer rounded"
					></div>
				</div>
			</div>
		{/each}
	</div>
{/if}

<!-- Element that will trigger loading more posts -->
<div bind:this={loadMoreTrigger} class="h-10 mt-8"></div>
