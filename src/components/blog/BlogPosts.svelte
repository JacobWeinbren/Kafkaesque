<script lang="ts">
	import { onMount, onDestroy } from "svelte"; // tick is no longer needed
	import { fade } from "svelte/transition";

	// Interface for the post data expected from the API
	interface BlogPost {
		id: string;
		slug: string;
		title: string;
		subtitle: string; // Using subtitle for preview
		coverImage?: string | null;
		publishedAt: string;
		// tags?: { name: string; slug: string }[]; // Uncomment if using tags
	}

	// Component state
	let posts: BlogPost[] = [];
	let currentCursor: string | null = null;
	let hasMore: boolean = true; // Assume more initially
	let loading = false; // Track fetch status
	let initialLoadAttempted = false; // Track if first fetch completed
	let errorMessage: string | null = null; // Store fetch errors

	// Element refs
	let loadMoreTrigger: HTMLDivElement | undefined = undefined; // Element to trigger loading, initialize as undefined
	let observer: IntersectionObserver | null = null; // Observer instance

	// Function to fetch posts from the API endpoint
	async function loadPosts(cursor: string | null = null) {
		// Prevent concurrent fetches or fetching when no more data exists
		if (loading || (!hasMore && cursor !== null)) {
			return;
		}

		loading = true;
		errorMessage = null; // Clear previous errors
		const isInitialLoad = cursor === null;

		try {
			// Construct API URL with cursor if provided
			const apiUrl = cursor
				? `/api/posts?cursor=${encodeURIComponent(cursor)}`
				: "/api/posts";
			const res = await fetch(apiUrl);

			// Handle HTTP errors
			if (!res.ok) {
				let errorText = `HTTP error ${res.status}`;
				try {
					// Try to get more specific error from response body
					const errorData = await res.json();
					errorText = errorData.error || errorText;
				} catch {
					/* ignore json parsing error if body isn't JSON */
				}
				throw new Error(`Failed to load posts: ${errorText}`);
			}

			// Parse JSON response
			const data: {
				posts: BlogPost[];
				hasMore: boolean;
				endCursor: string | null;
			} = await res.json();

			// Process fetched posts
			if (data.posts && data.posts.length > 0) {
				// Filter out potential duplicates before adding
				const newPosts = data.posts.filter(
					(newPost) =>
						!posts.some((existing) => existing.id === newPost.id)
				);
				// Append or replace posts based on initial load or not
				posts = isInitialLoad ? newPosts : [...posts, ...newPosts];
			} else if (isInitialLoad) {
				// Ensure posts array is empty if initial load yields nothing
				posts = [];
			}

			// Update pagination state
			currentCursor = data.endCursor || null;
			hasMore = data.hasMore;
		} catch (e: any) {
			// Handle fetch or processing errors
			console.error("Error loading posts:", e); // Keep essential error logging
			errorMessage = e.message || "An unknown error occurred.";
			hasMore = false; // Stop trying to load more on error
		} finally {
			// Ensure loading state is reset
			loading = false;
			if (isInitialLoad) {
				initialLoadAttempted = true;
				// Observer setup is now handled by the reactive statement below
			}
		}
	}

	// Setup the Intersection Observer - accepts the element to observe
	function setupObserver(elementToObserve: HTMLDivElement) {
		if (!elementToObserve) {
			// This check is mostly defensive now
			console.error("setupObserver called without a valid element.");
			return;
		}
		// Disconnect previous observer if it exists
		if (observer) observer.disconnect();

		observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					// Trigger load more only when intersecting, more posts might exist, and not currently loading
					if (entry.isIntersecting && hasMore && !loading) {
						loadPosts(currentCursor); // Load next batch
					}
				});
			},
			{
				rootMargin: "300px", // Load content 300px before it enters the viewport
				threshold: 0.01, // Trigger even if only slightly visible
			}
		);

		// Attach observer to the trigger element
		observer.observe(elementToObserve);
	}

	// Reactive statement to set up the observer once the trigger element exists
	// and the initial load is done.
	$: if (loadMoreTrigger && initialLoadAttempted && !observer) {
		// Check: Element bound? Initial load done? Observer not already set?
		setupObserver(loadMoreTrigger); // Pass the bound element
	}

	// Fetch initial posts when the component mounts
	onMount(() => {
		loadPosts(null); // Trigger initial fetch
	});

	// Clean up the observer when the component is destroyed
	onDestroy(() => {
		if (observer) {
			observer.disconnect(); // Prevent memory leaks
		}
	});

	// Helper function to format date (could be moved to a shared utility)
	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString("en-GB", {
			day: "numeric",
			month: "long",
			year: "numeric",
		});
	}
</script>

<!-- Skeleton Loader: Show ONLY during the very first load attempt -->
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

<!-- Error Message Display: Show if initial load fails -->
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
								loading={i < 3 ? "eager" : "lazy"}
								decoding="async"
								width="400"
								height="225"
								fetchpriority={i < 3 ? "high" : null}
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
						<!-- Display subtitle -->
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

<!-- Loading More Spinner: Show when loading subsequent pages -->
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
		<!-- Error message handled separately above -->
	</div>
{/if}

<!-- Intersection Observer Trigger: Rendered when more posts might exist and initial load is done -->
{#if hasMore && initialLoadAttempted}
	<div bind:this={loadMoreTrigger} class="h-10 mt-8" aria-hidden="true"></div>
{/if}
