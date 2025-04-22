<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { fade } from "svelte/transition";

	// Interface for the post data expected from the API
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
	let fetchAttempts = new Map<string, number>();

	// Element refs
	let loadMoreTrigger: HTMLDivElement | undefined = undefined;
	let observer: IntersectionObserver | null = null;

	// Function to fetch posts from the API endpoint
	async function loadPosts(cursor: string | null = null) {
		// Prevent concurrent fetches or fetching when no more data exists
		if (loading || (!hasMore && cursor !== null)) {
			return;
		}

		// BUGFIX: Prevent infinite loops with same cursor
		if (cursor) {
			const attempts = fetchAttempts.get(cursor) || 0;
			if (attempts >= 2) {
				console.warn(
					"Stopping pagination: same cursor requested multiple times",
					cursor
				);
				hasMore = false;
				return;
			}
			fetchAttempts.set(cursor, attempts + 1);
		}

		loading = true;
		errorMessage = null;
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

				// BUGFIX: If we got no new posts but API claims there are more,
				// stop pagination to prevent infinite loops
				if (newPosts.length === 0 && !isInitialLoad) {
					console.warn(
						"No new posts returned but API claims more exist. Stopping pagination."
					);
					hasMore = false;
				} else {
					// Append or replace posts based on initial load or not
					posts = isInitialLoad ? newPosts : [...posts, ...newPosts];

					// Update pagination state
					currentCursor = data.endCursor || null;
					hasMore = data.hasMore;
				}
			} else if (isInitialLoad) {
				// Ensure posts array is empty if initial load yields nothing
				posts = [];
				hasMore = false;
			} else {
				// No posts in non-initial load means we've reached the end
				hasMore = false;
			}
		} catch (e: any) {
			console.error("Error loading posts:", e);
			errorMessage = e.message || "An unknown error occurred.";
			hasMore = false;
		} finally {
			loading = false;
			if (isInitialLoad) {
				initialLoadAttempted = true;
			}
		}
	}

	// Setup the Intersection Observer
	function setupObserver(elementToObserve: HTMLDivElement) {
		if (!elementToObserve) {
			return;
		}

		if (observer) observer.disconnect();

		observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting && hasMore && !loading) {
						loadPosts(currentCursor);
					}
				});
			},
			{
				rootMargin: "300px",
				threshold: 0.01,
			}
		);

		observer.observe(elementToObserve);
	}

	// Set up the observer once the trigger element exists and initial load is done
	$: if (loadMoreTrigger && initialLoadAttempted && !observer) {
		setupObserver(loadMoreTrigger);
	}

	// Fetch initial posts when the component mounts
	onMount(() => {
		loadPosts(null);
	});

	// Clean up the observer when the component is destroyed
	onDestroy(() => {
		if (observer) {
			observer.disconnect();
		}
	});

	// Helper function to format date
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
