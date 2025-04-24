<!-- BlogPosts.svelte -->
<script lang="ts">
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

		// console.log(`[BlogPosts] Fetching from API. Cursor: ${cursor}`); // Keep or remove debug logs

		try {
			const timestamp = Date.now();
			const apiUrl = `/api/posts${
				cursor ? `?cursor=${encodeURIComponent(cursor)}` : ""
			}${cursor ? "&" : "?"}t=${timestamp}`;

			const res = await fetch(apiUrl);

			// console.log(`[BlogPosts] API Response Status: ${res.status}`); // Keep or remove debug logs
			if (!res.ok) {
				let errorText = `HTTP error ${res.status}`;
				try {
					const errorData = await res.json();
					// console.error("[BlogPosts] API Error Response Body:", errorData); // Keep or remove debug logs
					errorText = errorData.error || errorText;
				} catch {
					/* Ignore */
				}
				throw new Error(`Failed to load posts: ${errorText}`);
			}

			const data: PostsApiResponse = await res.json();

			// console.log("[BlogPosts] Data received from API:", JSON.stringify(data, null, 2)); // Keep or remove debug logs
			// if (data.posts && data.posts.length > 0) {
			// 	console.log(`[BlogPosts] First post title received: ${data.posts[0].title}`);
			// } else {
			// 	console.log("[BlogPosts] No posts received in API data.");
			// }

			// --- SORTING LOGIC ADDED HERE ---
			if (data.posts?.length > 0) {
				const combinedPosts = isInitialLoad
					? data.posts
					: [...posts, ...data.posts];
				// Sort the combined list by publishedAt descending
				combinedPosts.sort(
					(a, b) =>
						new Date(b.publishedAt).getTime() -
						new Date(a.publishedAt).getTime()
				);
				posts = combinedPosts; // Update the reactive variable
				currentCursor = data.endCursor;
				hasMore = data.hasMore;
			} else {
				if (isInitialLoad) posts = []; // Clear posts if initial load returns none
				hasMore = false;
			}
			// --- END SORTING LOGIC ---
		} catch (e: any) {
			errorMessage = e.message || "An unknown error occurred.";
			console.error(
				"[BlogPosts] Error during loadPosts fetch/processing:",
				e
			);
			hasMore = false;
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
			{ rootMargin: "300px", threshold: 0.01 }
		);
		observer.observe(loadMoreTrigger);
	}

	$: if (
		loadMoreTrigger &&
		initialLoadAttempted &&
		hasMore &&
		!loading &&
		!observer
	) {
		setupObserver();
	} else if (observer && (!hasMore || loading)) {
		observer.disconnect();
		observer = null;
	}

	onMount(() => loadPosts(null));
	onDestroy(() => {
		if (observer) observer.disconnect();
	});
</script>

<!-- TEMPLATE REMAINS EXACTLY THE SAME AS YOUR LAST VERSION -->
<!-- Container to stabilize layout -->
<div class="min-h-[60vh]">
	<!-- Initial Skeleton Loader -->
	{#if loading && !initialLoadAttempted}
		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each Array(6) as _}
				<div
					class="bg-white rounded-xl overflow-hidden border border-slate-100 shadow-xs flex flex-col animate-pulse"
					aria-hidden="true"
				>
					<div
						class="relative w-full bg-slate-200"
						style="aspect-ratio: 16 / 9;"
					></div>
					<div class="p-5 flex-grow flex flex-col">
						<div class="h-4 w-24 bg-slate-200 mb-2 rounded"></div>
						<div class="space-y-1.5 mb-2">
							<div
								class="h-5 w-full bg-slate-200 rounded-md"
							></div>
							<div
								class="h-5 w-5/6 bg-slate-200 rounded-md"
							></div>
						</div>
						<div class="flex-grow mb-4 space-y-1.5">
							<div class="h-4 w-full bg-slate-200 rounded"></div>
							<div class="h-4 w-full bg-slate-200 rounded"></div>
							<div class="h-4 w-3/4 bg-slate-200 rounded"></div>
						</div>
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
					class="group bg-white rounded-xl overflow-hidden border border-slate-100 hover:border-green-200 hover:shadow shadow-xs transition-all duration-300 h-full flex flex-col"
				>
					<a href={`/post/${post.slug}`} class="h-full flex flex-col">
						{#if coverImageUrl}
							<div
								class="relative overflow-hidden bg-slate-100"
								style="aspect-ratio: 16 / 9;"
							>
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
