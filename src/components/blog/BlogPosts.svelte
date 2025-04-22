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

	// Debug state
	let debugMode = true;
	let debugLogs: string[] = [];
	let apiResponses: any[] = [];
	let observerEvents = 0;
	let manualLoadAttempts = 0;

	// Element refs
	let loadMoreTrigger: HTMLDivElement | undefined = undefined;
	let observer: IntersectionObserver | null = null;

	function debugLog(message: string, data?: any) {
		const timestamp = new Date().toISOString().substring(11, 23);
		const logMessage = `${timestamp} - ${message}`;
		console.log(logMessage, data);
		debugLogs = [
			...debugLogs,
			data ? `${logMessage} ${JSON.stringify(data)}` : logMessage,
		];
		if (debugLogs.length > 30) debugLogs = debugLogs.slice(-30);
	}

	// Function to fetch posts from the API endpoint
	async function loadPosts(cursor: string | null = null, isManual = false) {
		// Prevent concurrent fetches or fetching when no more data exists
		if (loading || (!hasMore && cursor !== null)) {
			debugLog(
				`🛑 Load prevented: loading=${loading}, hasMore=${hasMore}, cursor=${cursor}`
			);
			return;
		}

		loading = true;
		errorMessage = null;
		const isInitialLoad = cursor === null;
		if (isManual) manualLoadAttempts++;

		debugLog(
			`🔄 Starting fetch: cursor=${cursor}, isInitial=${isInitialLoad}, isManual=${isManual}`
		);

		try {
			// Construct API URL with cursor if provided
			const apiUrl = cursor
				? `/api/posts?cursor=${encodeURIComponent(cursor)}`
				: "/api/posts";

			debugLog(`📡 Fetching from: ${apiUrl}`);

			const res = await fetch(apiUrl, {
				// Add cache-busting for debugging
				headers: debugMode
					? {
							"Cache-Control":
								"no-cache, no-store, must-revalidate",
							Pragma: "no-cache",
						}
					: undefined,
			});

			debugLog(`📥 Response status: ${res.status} ${res.statusText}`);

			// Handle HTTP errors
			if (!res.ok) {
				let errorText = `HTTP error ${res.status}`;
				try {
					const errorData = await res.json();
					errorText = errorData.error || errorText;
					debugLog(`⚠️ Error response body:`, errorData);
				} catch (e) {
					debugLog(`⚠️ Failed to parse error response as JSON`);
				}
				throw new Error(`Failed to load posts: ${errorText}`);
			}

			// Parse JSON response
			const responseText = await res.text();
			debugLog(`📄 Response raw length: ${responseText.length} chars`);
			let data;

			try {
				data = JSON.parse(responseText);
				debugLog(`📊 Parsed response:`, {
					postCount: data.posts?.length || 0,
					hasMore: data.hasMore,
					endCursor: data.endCursor,
				});
				apiResponses = [
					...apiResponses,
					{
						url: apiUrl,
						timestamp: new Date().toISOString(),
						data: {
							postCount: data.posts?.length || 0,
							hasMore: data.hasMore,
							endCursor: data.endCursor,
						},
					},
				];
			} catch (e) {
				debugLog(`❌ JSON parse error:`, e);
				debugLog(
					`🔍 Response preview: ${responseText.substring(0, 100)}...`
				);
				throw new Error(`Failed to parse API response as JSON`);
			}

			// Process fetched posts
			if (data.posts && data.posts.length > 0) {
				debugLog(`✅ Received ${data.posts.length} posts`);

				// Filter out potential duplicates before adding
				const newPosts = data.posts.filter(
					(newPost) =>
						!posts.some((existing) => existing.id === newPost.id)
				);

				debugLog(
					`📌 After duplicate filtering: ${newPosts.length} unique posts`
				);

				// Append or replace posts based on initial load or not
				posts = isInitialLoad ? newPosts : [...posts, ...newPosts];
				debugLog(`📈 Total posts now: ${posts.length}`);
			} else if (isInitialLoad) {
				debugLog(`⚠️ Initial load returned no posts`);
				posts = [];
			} else {
				debugLog(`⚠️ No new posts in non-initial load`);
			}

			// Update pagination state
			currentCursor = data.endCursor || null;
			hasMore = data.hasMore;
			debugLog(
				`🔄 Updated state: cursor=${currentCursor}, hasMore=${hasMore}`
			);
		} catch (e: any) {
			debugLog(`❌ Error loading posts:`, e);
			console.error("Error loading posts:", e);
			errorMessage = e.message || "An unknown error occurred.";
			hasMore = false;
		} finally {
			loading = false;
			if (isInitialLoad) {
				initialLoadAttempted = true;
				debugLog(
					`🏁 Initial load complete: hasMore=${hasMore}, cursor=${currentCursor}`
				);
			}
		}
	}

	// Setup the Intersection Observer
	function setupObserver(elementToObserve: HTMLDivElement) {
		if (!elementToObserve) {
			debugLog(`❌ setupObserver called without valid element`);
			return;
		}

		// Disconnect previous observer if it exists
		if (observer) {
			debugLog(`🔄 Disconnecting previous observer`);
			observer.disconnect();
		}

		debugLog(`🔍 Setting up new IntersectionObserver`);
		observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					observerEvents++;
					debugLog(
						`👁️ Observer event: intersecting=${entry.isIntersecting}, hasMore=${hasMore}, loading=${loading}`
					);

					// Trigger load more only when intersecting, more posts might exist, and not currently loading
					if (entry.isIntersecting && hasMore && !loading) {
						debugLog(
							`✅ Observer triggering loadPosts with cursor=${currentCursor}`
						);
						loadPosts(currentCursor);
					}
				});
			},
			{
				rootMargin: "300px",
				threshold: 0.01,
			}
		);

		// Attach observer to the trigger element
		observer.observe(elementToObserve);
		debugLog(`✅ Observer attached to trigger element`);
	}

	// Reactive debugging statement
	$: {
		debugLog(
			`🔄 State change: loadMoreTrigger=${!!loadMoreTrigger}, initialLoadAttempted=${initialLoadAttempted}, observer=${!!observer}, hasMore=${hasMore}, posts.length=${posts.length}`
		);
	}

	// Reactive statement to set up the observer
	$: if (loadMoreTrigger && initialLoadAttempted && !observer) {
		debugLog(`🏁 Conditions met to setup observer`);
		setupObserver(loadMoreTrigger);
	}

	// Fetch initial posts when the component mounts
	onMount(() => {
		debugLog(`🚀 Component mounted`);
		loadPosts(null);
	});

	// Clean up the observer when the component is destroyed
	onDestroy(() => {
		if (observer) {
			debugLog(`🧹 Cleaning up observer on destroy`);
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

	// Manual debug functions
	function forceLoadMore() {
		debugLog(`🔨 Manual load triggered with cursor: ${currentCursor}`);
		loadPosts(currentCursor, true);
	}

	function resetObserver() {
		debugLog(`🔄 Manual observer reset`);
		if (observer) observer.disconnect();
		observer = null;
		if (loadMoreTrigger && initialLoadAttempted) {
			setupObserver(loadMoreTrigger);
		}
	}
</script>

<!-- Debug Panel -->
{#if debugMode}
	<div
		class="fixed bottom-0 right-0 bg-white border border-gray-300 shadow-lg p-3 max-w-sm max-h-96 overflow-y-auto z-50 opacity-90 hover:opacity-100 text-xs"
	>
		<div class="flex justify-between mb-2">
			<h3 class="font-bold">Infinite Scroll Debug</h3>
			<button
				class="bg-red-500 text-white px-2 rounded"
				on:click={() => (debugMode = false)}>X</button
			>
		</div>

		<div class="mb-2">
			<strong>State:</strong>
			<ul>
				<li>Posts: {posts.length}</li>
				<li>Cursor: {currentCursor || "null"}</li>
				<li>HasMore: {hasMore.toString()}</li>
				<li>Loading: {loading.toString()}</li>
				<li>Initial Load: {initialLoadAttempted.toString()}</li>
				<li>Observer: {observer ? "active" : "null"}</li>
				<li>Trigger Element: {loadMoreTrigger ? "bound" : "null"}</li>
				<li>Observer Events: {observerEvents}</li>
				<li>Manual Attempts: {manualLoadAttempts}</li>
			</ul>
		</div>

		<div class="mb-2 flex space-x-2">
			<button
				class="bg-blue-500 text-white px-2 py-1 rounded text-xs"
				on:click={forceLoadMore}
				disabled={loading || !hasMore}
			>
				Force Load More
			</button>

			<button
				class="bg-green-500 text-white px-2 py-1 rounded text-xs"
				on:click={resetObserver}
			>
				Reset Observer
			</button>
		</div>

		<div class="mb-2">
			<strong>API Calls ({apiResponses.length}):</strong>
			<ul class="text-xs">
				{#each apiResponses as resp, i}
					<li class="border-t pt-1 mt-1">
						{i + 1}. {resp.url} - Posts: {resp.data.postCount},
						More: {resp.data.hasMore.toString().substring(0, 1)}
					</li>
				{/each}
			</ul>
		</div>

		<div>
			<strong>Last 5 Logs:</strong>
			<ul class="text-xs">
				{#each debugLogs.slice(-5) as log}
					<li class="border-t pt-1 mt-1">{log}</li>
				{/each}
			</ul>
		</div>
	</div>
{:else}
	<button
		class="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded-full z-50 opacity-70 hover:opacity-100"
		on:click={() => (debugMode = true)}
	>
		🐞
	</button>
{/if}

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
	<div
		bind:this={loadMoreTrigger}
		class="h-10 mt-8 bg-gray-100 bg-opacity-25"
		aria-hidden="true"
		data-testid="load-more-trigger"
	>
		{#if debugMode}
			<div class="text-center text-xs text-gray-400">
				Observer Trigger Point
			</div>
		{/if}
	</div>
{/if}
