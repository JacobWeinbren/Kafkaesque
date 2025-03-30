<!-- BlogPosts.svelte -->
<script context="module" lang="ts">
	// Module context remains the same
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
	import { onMount, onDestroy } from "svelte";
	import { fade } from "svelte/transition";

	// Component props now have defaults for client-side loading
	export let initialPosts: BlogPost[] = [];
	export let initialHasMore: boolean = true; // Assume true until first fetch
	export let initialEndCursor: string | null = null; // Start with null

	let posts: BlogPost[] = initialPosts; // Starts empty
	let currentCursor: string | null = initialEndCursor; // Starts null
	let hasMore: boolean = initialHasMore; // Starts true
	let loading = false;
	let initialLoadDone = false; // Track if the first client fetch attempt is complete
	let loadMoreTrigger: HTMLDivElement;
	let observer: IntersectionObserver | null = null;

	async function loadMorePosts(isInitialLoad = false) {
		// Prevent loading if already loading, or if not initial load and no more posts
		// Allow initial load even if hasMore is technically false initially
		if (loading || (!hasMore && !isInitialLoad)) {
			if (!hasMore && !isInitialLoad) {
				initialLoadDone = true; // Ensure flag is set if we bail early
			}
			return;
		}

		loading = true;
		try {
			// Construct API URL: Use null/empty cursor for the very first load
			const cursorParam = currentCursor
				? `?cursor=${encodeURIComponent(currentCursor)}`
				: "";
			// Fetch from the API route
			const res = await fetch(`/api/posts${cursorParam}`);

			if (!res.ok) {
				const errorText = await res.text();
				throw new Error(
					`Failed to load posts: ${res.status} ${errorText}`
				);
			}
			const data = await res.json(); // Expect { posts: [], hasMore: bool, endCursor: string|null }

			if (data.posts && data.posts.length > 0) {
				// Replace posts on initial load, append otherwise
				posts = isInitialLoad ? data.posts : [...posts, ...data.posts];
				currentCursor = data.endCursor || null; // Update cursor
				hasMore = data.hasMore; // Update hasMore status
			} else {
				// If no posts returned (initial or subsequent), assume no more
				if (isInitialLoad) {
					posts = []; // Ensure posts is empty if initial load returns none
				}
				hasMore = false;
			}

			// Log the first post title after fetch for debugging
			if (posts.length > 0) {
				console.log(
					`Client fetched ${data.posts?.length || 0} posts. First post: ${posts[0].title}. HasMore: ${hasMore}`
				);
			} else {
				console.log(`Client fetched 0 posts. HasMore: ${hasMore}`);
			}
		} catch (e) {
			console.error("Error in loadMorePosts:", e);
			hasMore = false; // Stop trying on error
		} finally {
			loading = false;
			initialLoadDone = true; // Mark that an initial load attempt was made
		}
	}

	function setupObserver() {
		observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					// Trigger only after initial load attempt is done and if intersecting
					if (
						entry.isIntersecting &&
						hasMore &&
						!loading &&
						initialLoadDone
					) {
						console.log(
							"Intersection observer triggered loadMorePosts"
						);
						loadMorePosts();
					}
				});
			},
			{ rootMargin: "200px" } // Load when 200px away from viewport bottom
		);
		if (loadMoreTrigger) observer.observe(loadMoreTrigger);
	}

	onMount(() => {
		// Trigger the first load explicitly when component mounts
		console.log("BlogPosts component mounted, triggering initial load.");
		loadMorePosts(true); // Pass true for initial load
		setupObserver();
	});

	onDestroy(() => {
		// Clean up the observer when the component is destroyed
		if (observer && loadMoreTrigger) {
			observer.unobserve(loadMoreTrigger);
			console.log("Intersection observer disconnected.");
		}
	});
</script>

<!-- Skeleton Loader: Show ONLY during initial load (loading=true, posts empty) -->
{#if loading && posts.length === 0}
	<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
		{#each Array(6) as _, i}
			<!-- Show 6 skeletons initially -->
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

<!-- Post Grid: Render posts once available -->
{#if posts.length > 0}
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
						<time
							class="text-sm text-green-700 font-medium block mb-2"
						>
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

<!-- Loading More Spinner: Show when loading subsequent pages (loading=true, posts exist) -->
{#if loading && posts.length > 0}
	<div class="flex justify-center py-6">
		<div
			class="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-green-700"
		></div>
	</div>
{/if}

<!-- End of Posts / No Posts Message: Show only when initial load is done, no longer loading, and no more posts -->
{#if !loading && !hasMore && initialLoadDone}
	<div class="text-center py-6 text-gray-500 border-t mt-8 pt-4">
		{#if posts.length > 0}
			You've reached the end of the posts
		{:else}
			No posts found. <!-- Message if zero posts were ever loaded -->
		{/if}
	</div>
{/if}

<!-- Element that will trigger loading more posts via IntersectionObserver -->
<!-- Only render trigger if we think there are more posts OR initial load isn't done yet -->
{#if hasMore || !initialLoadDone}
	<div bind:this={loadMoreTrigger} class="h-10 mt-8"></div>
{/if}
