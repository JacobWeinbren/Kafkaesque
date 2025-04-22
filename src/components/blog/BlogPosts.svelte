<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { fade } from "svelte/transition";

	// Interface now expects subtitle, removed brief
	interface BlogPost {
		id: string;
		slug: string;
		title: string;
		subtitle: string; // Use subtitle for preview
		coverImage?: string | null;
		publishedAt: string;
		// tags?: { name: string; slug: string }[];
	}

	// Component state - no changes needed here
	let posts: BlogPost[] = [];
	let currentCursor: string | null = null;
	let hasMore: boolean = true;
	let loading = false;
	let initialLoadAttempted = false;
	let errorMessage: string | null = null;

	// Element refs - no changes needed here
	let loadMoreTrigger: HTMLDivElement;
	let observer: IntersectionObserver | null = null;

	// Function to fetch posts - no changes needed here,
	// it fetches from /api/posts which uses the updated getPosts
	async function loadPosts(cursor: string | null = null) {
		if (loading || (!hasMore && cursor !== null)) {
			return;
		}
		loading = true;
		errorMessage = null;
		const isInitialLoad = cursor === null;
		try {
			const apiUrl = cursor
				? `/api/posts?cursor=${encodeURIComponent(cursor)}`
				: "/api/posts";
			const res = await fetch(apiUrl);
			if (!res.ok) {
				let errorText = `HTTP error ${res.status}`;
				try {
					const errorData = await res.json();
					errorText = errorData.error || errorText;
				} catch {
					/* ignore */
				}
				throw new Error(`Failed to load posts: ${errorText}`);
			}
			const data: {
				posts: BlogPost[];
				hasMore: boolean;
				endCursor: string | null;
			} = await res.json();

			if (data.posts && data.posts.length > 0) {
				const newPosts = data.posts.filter(
					(newPost) =>
						!posts.some((existing) => existing.id === newPost.id)
				);
				// Ensure the fetched data matches the updated BlogPost interface
				posts = isInitialLoad ? newPosts : [...posts, ...newPosts];
			} else if (isInitialLoad) {
				posts = [];
			}
			currentCursor = data.endCursor || null;
			hasMore = data.hasMore;
		} catch (e: any) {
			console.error("Error in loadPosts:", e);
			errorMessage = e.message || "An unknown error occurred.";
			hasMore = false;
		} finally {
			loading = false;
			if (isInitialLoad) {
				initialLoadAttempted = true;
				if (!observer) {
					setupObserver();
				}
			}
		}
	}

	// Setup observer - no changes needed here
	function setupObserver() {
		if (observer) observer.disconnect();
		observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting && hasMore && !loading) {
						loadPosts(currentCursor);
					}
				});
			},
			{ rootMargin: "300px" }
		);
		if (loadMoreTrigger) {
			observer.observe(loadMoreTrigger);
		}
	}

	// Lifecycle hooks - no changes needed here
	onMount(() => {
		loadPosts(null);
	});
	onDestroy(() => {
		if (observer) {
			observer.disconnect();
		}
	});

	// Helper - no changes needed here
	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString("en-GB", {
			day: "numeric",
			month: "long",
			year: "numeric",
		});
	}
</script>

<!-- Skeleton Loader - no changes needed -->
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

<!-- Error Message Display - no changes needed -->
{#if errorMessage && posts.length === 0}
	<div
		class="text-center py-6 text-red-600 border border-red-200 bg-red-50 p-4 rounded"
	>
		<p>Could not load posts:</p>
		<p class="text-sm">{errorMessage}</p>
	</div>
{/if}

<!-- Post Grid: Render posts once available -->
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
								loading={i === 0 ? "eager" : "lazy"}
								decoding="async"
								width="400"
								height="225"
								fetchpriority={i === 0 ? "high" : null}
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
						<!-- Display subtitle instead of brief -->
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

<!-- Loading More Spinner - no changes needed -->
{#if loading && initialLoadAttempted && posts.length > 0}
	<div class="flex justify-center py-6" aria-live="polite">
		<div
			class="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-green-700"
			role="status"
			aria-label="Loading more posts"
		></div>
	</div>
{/if}

<!-- End of Posts / No Posts Message - no changes needed -->
{#if !loading && !hasMore && initialLoadAttempted}
	<div class="text-center py-6 text-gray-500 border-t mt-8 pt-4">
		{#if posts.length > 0}
			You've reached the end of the posts.
		{:else if !errorMessage}
			No posts found.
		{/if}
	</div>
{/if}

<!-- Intersection Observer Trigger - no changes needed -->
{#if hasMore && initialLoadAttempted}
	<div bind:this={loadMoreTrigger} class="h-10 mt-8"></div>
{/if}
