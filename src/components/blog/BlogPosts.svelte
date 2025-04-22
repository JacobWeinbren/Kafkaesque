<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { fade } from "svelte/transition";

	interface BlogPost {
		id: string;
		slug: string;
		title: string;
		subtitle: string;
		coverImage?: string | null;
		publishedAt: string;
	}

	// Component state
	let posts: BlogPost[] = [];
	let currentCursor: string | null = null;
	let hasMore: boolean = true;
	let loading = false;
	let initialLoadAttempted = false;
	let errorMessage: string | null = null;

	// Element ref for intersection observer
	let loadMoreTrigger: HTMLDivElement | undefined = undefined;
	let observer: IntersectionObserver | null = null;

	async function loadPosts(cursor: string | null = null) {
		if (loading || (!hasMore && cursor !== null)) return;

		loading = true;
		errorMessage = null;
		const isInitialLoad = cursor === null;

		try {
			const timestamp = Date.now();
			const apiUrl = `/api/posts${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ""}${cursor ? "&" : "?"}_t=${timestamp}`;

			const res = await fetch(apiUrl);

			if (!res.ok) {
				const errorText =
					res.status === 500
						? (await res.json()).error || `HTTP error ${res.status}`
						: `HTTP error ${res.status}`;
				throw new Error(`Failed to load posts: ${errorText}`);
			}

			const data = await res.json();

			if (data.posts?.length > 0) {
				// For initial load, replace posts. Otherwise, append.
				posts = isInitialLoad ? data.posts : [...posts, ...data.posts];
				currentCursor = data.endCursor;
				hasMore = data.hasMore;
			} else {
				// No posts returned
				if (isInitialLoad) posts = [];
				hasMore = false;
			}
		} catch (e: any) {
			errorMessage = e.message || "An unknown error occurred.";
			hasMore = false;
		} finally {
			loading = false;
			initialLoadAttempted = true;
		}
	}

	// Set up intersection observer
	function setupObserver() {
		if (!loadMoreTrigger || observer) return;

		observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && hasMore && !loading) {
					loadPosts(currentCursor);
				}
			},
			{ rootMargin: "300px", threshold: 0.01 }
		);

		observer.observe(loadMoreTrigger);
	}

	// Setup observer when conditions are met
	$: if (loadMoreTrigger && initialLoadAttempted && hasMore) {
		setupObserver();
	}

	onMount(() => loadPosts(null));

	onDestroy(() => {
		if (observer) observer.disconnect();
	});

	// Format date helper
	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString("en-GB", {
			day: "numeric",
			month: "long",
			year: "numeric",
		});
	}
</script>

<!-- Skeleton Loader -->
{#if loading && !initialLoadAttempted}
	<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
		{#each Array(6) as _, i}
			<div
				class="bg-white rounded-lg overflow-hidden border border-gray-200 h-full animate-pulse"
			>
				<div class="h-48 bg-gray-200"></div>
				<div class="p-5">
					<div class="h-4 w-24 bg-gray-200 mb-4 rounded"></div>
					<div class="h-5 w-full bg-gray-200 mb-3 rounded"></div>
					<div class="h-5 w-3/4 bg-gray-200 mb-4 rounded"></div>
					<div class="h-4 w-full bg-gray-200 mb-2 rounded"></div>
					<div class="h-4 w-5/6 bg-gray-200 mb-6 rounded"></div>
					<div class="h-4 w-20 bg-gray-200 rounded"></div>
				</div>
			</div>
		{/each}
	</div>
{/if}

<!-- Error Message Display -->
{#if errorMessage && posts.length === 0}
	<div
		class="text-center py-6 text-red-600 border border-red-200 bg-red-50 p-4 rounded"
	>
		<p>Could not load posts:</p>
		<p class="text-sm">{errorMessage}</p>
	</div>
{/if}

<!-- Post Grid -->
{#if posts.length > 0}
	<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
		{#each posts as post, i (post.id)}
			<article
				in:fade={{ duration: 200, delay: (i % 6) * 50 }}
				class="group bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-all duration-300 h-full flex flex-col"
			>
				<a href={`/post/${post.slug}`} class="h-full flex flex-col">
					{#if post.coverImage}
						<div class="relative h-48 overflow-hidden bg-gray-100">
							<img
								src={post.coverImage}
								alt={post.title}
								class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
								loading={i < 2 ? "eager" : "lazy"}
								decoding="async"
								width="400"
								height="225"
								fetchpriority={i < 2 ? "high" : "auto"}
								style="aspect-ratio: 16/9;"
							/>
						</div>
					{/if}
					<div class="p-5 flex-grow flex flex-col">
						<time
							class="text-sm text-green-700 font-medium block mb-2"
						>
							{formatDate(post.publishedAt)}
						</time>
						<h2
							class="text-lg font-display font-bold text-gray-900 mb-2 group-hover:text-green-700 transition"
						>
							{post.title}
						</h2>
						<p
							class="text-gray-600 text-sm line-clamp-3 mb-4 flex-grow"
						>
							{post.subtitle || ""}
						</p>
						<div
							class="flex items-center text-green-700 text-sm font-medium mt-auto"
						>
							Read more
							<svg
								class="ml-1 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M14 5l7 7m0 0l-7 7m7-7H3"
								/>
							</svg>
						</div>
					</div>
				</a>
			</article>
		{/each}
	</div>
{/if}

<!-- Loading More Spinner -->
{#if loading && initialLoadAttempted && posts.length > 0}
	<div class="flex justify-center py-6" aria-live="polite">
		<div
			class="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-green-700"
			role="status"
			aria-label="Loading more posts"
		></div>
	</div>
{/if}

<!-- End of Posts / No Posts Message -->
{#if !loading && !hasMore && initialLoadAttempted}
	<div class="text-center py-6 text-gray-500 border-t mt-8 pt-4">
		{#if posts.length > 0}
			You've reached the end of the posts.
		{:else if !errorMessage}
			No posts found.
		{/if}
	</div>
{/if}

<!-- Intersection Observer Trigger -->
{#if hasMore && initialLoadAttempted}
	<div bind:this={loadMoreTrigger} class="h-10 mt-8" aria-hidden="true"></div>
{/if}
