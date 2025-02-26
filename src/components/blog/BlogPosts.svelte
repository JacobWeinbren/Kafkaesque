<script context="module" lang="ts">
	// Move export of types to module context.
	export interface BlogPost {
		id: string;
		slug: string;
		title: string;
		subtitle: string;
		coverImage?: string | null;
		publishedAt: string;
		// additional properties...
	}
</script>

<script lang="ts">
	import { onMount } from "svelte";
	import { fade, fly } from "svelte/transition";

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
			in:fly={{ y: 20, duration: 300, delay: (i % 3) * 100 }}
			class="group bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:border-green-200 h-full flex flex-col"
		>
			<a href={`/post/${post.slug}`} class="block h-full flex flex-col">
				{#if post.coverImage}
					<div class="relative h-48 overflow-hidden bg-gray-100">
						<img
							src={post.coverImage}
							alt={post.title}
							class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
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
				<div class="p-6 flex-grow flex flex-col">
					<time class="text-sm text-green-600 font-medium block mb-2">
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
						class="text-xl font-display font-bold text-gray-900 mb-3 group-hover:text-green-600 transition"
					>
						{post.title}
					</h2>
					<p class="text-gray-600 line-clamp-2 mb-4 flex-grow">
						{post.subtitle}
					</p>
					<div
						class="flex items-center text-green-600 text-sm font-medium mt-auto"
					>
						Read more
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							class="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
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
	<div class="flex justify-center py-8">
		<div
			class="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-green-600"
		></div>
	</div>
{/if}

{#if !hasMore && posts.length > 0}
	<div class="text-center py-8 text-gray-500 border-t mt-8 pt-6">
		You've reached the end of the posts
	</div>
{/if}

<!-- Skeleton loader for posts -->
{#if loading && posts.length === 0}
	<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
		{#each Array(3) as _, i}
			<div
				class="bg-white rounded-xl overflow-hidden border border-gray-100 h-full"
			>
				<div class="h-48 bg-gray-100 animate-shimmer"></div>
				<div class="p-6">
					<div
						class="h-4 w-24 bg-gray-100 animate-shimmer mb-4 rounded"
					></div>
					<div
						class="h-6 w-full bg-gray-100 animate-shimmer mb-3 rounded"
					></div>
					<div
						class="h-6 w-3/4 bg-gray-100 animate-shimmer mb-4 rounded"
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
