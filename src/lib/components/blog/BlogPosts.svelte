<!-- BlogPosts.svelte -->
<script lang="ts">
	// --- SCRIPT SECTION (UNCHANGED from your last version) ---
	import { onMount, onDestroy } from "svelte";
	import { fade } from "svelte/transition";
	import { formatDate } from "$lib/utils/helpers";
	import {
		Image,
		AlertTriangle,
		ArrowRight,
		Sparkles,
		FileText,
	} from "lucide-svelte";

	interface BlogPost {
		id: string;
		slug: string;
		title: string;
		subtitle: string;
		coverImage: { src: string } | null;
		publishedAt: string;
	}

	interface PostsApiResponse {
		posts: BlogPost[];
		hasMore: boolean;
		endCursor: string | null;
	}

	let posts: BlogPost[] = [];
	let currentCursor: string | null = null;
	let hasMore: boolean = true;
	let loading = false;
	let initialLoadAttempted = false;
	let errorMessage: string | null = null;

	let loadMoreTrigger: HTMLDivElement | undefined = undefined;
	let observer: IntersectionObserver | null = null;

	async function loadPosts(cursor: string | null = null) {
		if (loading || (!hasMore && cursor !== null)) return;

		loading = true;
		errorMessage = null;
		const isInitialLoad = cursor === null;

		try {
			const timestamp = Date.now();
			const apiUrl = `/api/posts${
				cursor ? `?cursor=${encodeURIComponent(cursor)}` : ""
			}${cursor ? "&" : "?"}t=${timestamp}`;

			const res = await fetch(apiUrl);

			if (!res.ok) {
				let errorText = `HTTP error ${res.status}`;
				try {
					const errorData = await res.json();
					errorText = errorData.error || errorText;
				} catch {
					/* Ignore if response body is not JSON */
				}
				throw new Error(`Failed to load posts: ${errorText}`);
			}

			const data: PostsApiResponse = await res.json();

			if (data.posts?.length > 0) {
				posts = isInitialLoad ? data.posts : [...posts, ...data.posts];
				currentCursor = data.endCursor;
				hasMore = data.hasMore;
			} else {
				if (isInitialLoad) posts = [];
				hasMore = false;
			}
		} catch (e: any) {
			errorMessage = e.message || "An unknown error occurred.";
			console.error("Error loading posts:", e);
			hasMore = false; // Stop trying if there's an error
		} finally {
			loading = false;
			initialLoadAttempted = true;
		}
	}

	function setupObserver() {
		if (!loadMoreTrigger || observer) return;

		observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && hasMore && !loading) {
					loadPosts(currentCursor);
				}
			},
			{ rootMargin: "300px", threshold: 0.01 } // Load slightly before it enters viewport
		);
		observer.observe(loadMoreTrigger);
	}

	// Reactive statement to manage the observer
	$: if (
		loadMoreTrigger &&
		initialLoadAttempted &&
		hasMore &&
		!loading &&
		!observer
	) {
		setupObserver();
	} else if (observer && (!hasMore || loading)) {
		// Disconnect if no more posts or currently loading
		observer.disconnect();
		observer = null;
	}

	onMount(() => loadPosts(null));
	onDestroy(() => {
		if (observer) observer.disconnect();
	});
	// --- END SCRIPT SECTION ---
</script>

<!-- Container to stabilize layout -->
<div class="min-h-[60vh]">
	<!-- Initial Skeleton Loader - Refined for Layout Stability -->
	{#if loading && !initialLoadAttempted}
		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each Array(6) as _}
				<div
					class="bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm flex flex-col animate-pulse"
					aria-hidden="true"
				>
					<!-- 1. Image Placeholder: Use aspect-ratio -->
					<div
						class="relative w-full bg-slate-200"
						style="aspect-ratio: 16 / 9;"
					></div>
					<!-- 2. Text Content Area: Mimic padding and flex structure -->
					<div class="p-5 flex-grow flex flex-col">
						<!-- Mimic Time -->
						<div class="h-4 w-24 bg-slate-200 mb-2 rounded"></div>
						<!-- Mimic Title (2 lines, now Inter) -->
						<div class="space-y-1.5 mb-2">
							<div
								class="h-5 w-full bg-slate-200 rounded-md"
							></div>
							<div
								class="h-5 w-5/6 bg-slate-200 rounded-md"
							></div>
						</div>
						<!-- Mimic Subtitle (3 lines, now Inter) + flex-grow -->
						<div class="flex-grow mb-4 space-y-1.5">
							<div class="h-4 w-full bg-slate-200 rounded"></div>
							<div class="h-4 w-full bg-slate-200 rounded"></div>
							<div class="h-4 w-3/4 bg-slate-200 rounded"></div>
						</div>
						<!-- Mimic "Read article" link -->
						<div
							class="h-4 w-28 bg-slate-200 rounded mt-auto"
						></div>
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Error Message -->
	{#if errorMessage && posts.length === 0}
		<div
			class="text-center py-6 text-red-600 border border-red-100 bg-red-50/50 p-6 rounded-xl"
			role="alert"
		>
			<AlertTriangle class="h-12 w-12 mx-auto mb-3 text-red-500" />
			<p class="font-medium text-lg">Could not load posts</p>
			<p class="text-sm mt-1">{errorMessage}</p>
		</div>
	{/if}

	<!-- Post Grid -->
	{#if posts.length > 0}
		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each posts as post, i (post.id)}
				{@const coverImageUrl = post.coverImage?.src
					? `/api/image?url=${encodeURIComponent(
							post.coverImage.src
						)}&w=800&h=450&q=75`
					: null}
				<article
					in:fade={{ duration: 300, delay: (i % 6) * 75 }}
					class="group bg-white rounded-xl overflow-hidden border border-slate-100 hover:border-green-200 hover:shadow-md shadow-sm transition-all duration-300 h-full flex flex-col"
				>
					<a href={`/post/${post.slug}`} class="h-full flex flex-col">
						{#if coverImageUrl}
							<div
								class="relative overflow-hidden bg-slate-100"
								style="aspect-ratio: 16 / 9;"
							>
								<!-- Applied aspect-ratio here too for consistency -->
								<img
									src={coverImageUrl}
									alt={post.title}
									class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
									loading={i < 3 ? "eager" : "lazy"}
									decoding="async"
									fetchpriority={i < 3 ? "high" : "auto"}
									width="800"
									height="450"
								/>
								<div
									class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
								></div>
							</div>
						{:else}
							<!-- Placeholder for posts without cover images -->
							<div
								class="relative bg-gradient-to-br from-green-50 to-slate-100 flex items-center justify-center text-slate-400"
								style="aspect-ratio: 16 / 9;"
							>
								<Image class="h-16 w-16 opacity-30" />
							</div>
						{/if}
						<div class="p-5 flex-grow flex flex-col">
							<time
								class="text-sm text-green-600 font-medium block mb-2 h-5"
								datetime={post.publishedAt}
							>
								{formatDate(post.publishedAt)}
							</time>
							<h2
								class="text-lg font-display font-bold text-slate-800 mb-2 group-hover:text-green-700 transition line-clamp-2 min-h-[3.5rem]"
							>
								{post.title}
							</h2>
							{#if post.subtitle}
								<p
									class="text-slate-600 text-sm line-clamp-3 mb-4 flex-grow min-h-[3rem]"
								>
									{post.subtitle}
								</p>
							{:else}
								<!-- Add placeholder div to maintain consistent height when no subtitle -->
								<div class="mb-4 flex-grow min-h-[3rem]"></div>
							{/if}
							<div
								class="flex items-center text-green-600 text-sm font-medium mt-auto group-hover:text-green-700 transition h-5"
							>
								Read article
								<ArrowRight
									class="ml-1 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
								/>
							</div>
						</div>
					</a>
				</article>
			{/each}
		</div>
	{/if}

	<!-- Loading More Spinner -->
	{#if loading && initialLoadAttempted && posts.length > 0}
		<div class="flex justify-center py-8 h-[58px]" aria-live="polite">
			<div class="relative h-10 w-10">
				<div
					class="absolute animate-spin rounded-full h-full w-full border-4 border-slate-200"
				></div>
				<div
					class="absolute animate-spin rounded-full h-full w-full border-4 border-green-600 border-t-transparent"
				></div>
			</div>
		</div>
	{/if}

	<!-- End of Posts / No Posts Message -->
	{#if !loading && !hasMore && initialLoadAttempted}
		<div class="text-center py-8 text-slate-500 min-h-[58px]">
			{#if posts.length > 0}
				<div class="border-t border-slate-100 pt-6 mt-4">
					<Sparkles class="h-6 w-6 mx-auto mb-2 text-slate-400" />
					<p>You've reached the end of the posts</p>
				</div>
			{:else if !errorMessage}
				<div
					class="py-16 bg-slate-50 rounded-xl border border-slate-200"
				>
					<FileText class="h-12 w-12 mx-auto mb-3 text-slate-400" />
					<p class="font-medium">No posts found</p>
					<p class="text-sm mt-1">Check back soon for new content</p>
				</div>
			{/if}
		</div>
	{/if}

	<!-- Intersection Observer Trigger -->
	{#if hasMore && initialLoadAttempted && !loading}
		<div bind:this={loadMoreTrigger} class="h-10 mt-8 invisible"></div>
	{/if}
</div>
<!-- End Container -->
