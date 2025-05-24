<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { fade } from "svelte/transition";
	import { formatDate } from "$lib/utils/helpers";
	import {
		Image,
		AlertTriangle,
		ArrowRight,
		FileText,
		Clock,
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
	let hasMore = true;
	let loading = false;
	let initialLoadAttempted = false;
	let errorMessage: string | null = null;

	// svelte-ignore let-var
	let loadMoreTrigger: HTMLDivElement;
	let observer: IntersectionObserver | null = null;

	async function loadPosts(cursor: string | null) {
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
					/* Ignore */
				}
				throw new Error(`Failed to load posts: ${errorText}`);
			}

			const data: PostsApiResponse = await res.json();

			if (data.posts?.length > 0) {
				const combinedPosts = isInitialLoad
					? data.posts
					: [...posts, ...data.posts];

				combinedPosts.sort(
					(a, b) =>
						new Date(b.publishedAt).getTime() -
						new Date(a.publishedAt).getTime()
				);
				posts = combinedPosts;
				currentCursor = data.endCursor;
				hasMore = data.hasMore;
			} else {
				if (isInitialLoad) posts = [];
				hasMore = false;
				if (isInitialLoad) currentCursor = null;
			}
		} catch (e) {
			const err = e instanceof Error ? e : new Error(String(e));
			errorMessage = err.message || "An unknown error occurred.";
			console.error("Error loading posts:", err);
			hasMore = false;
			if (isInitialLoad) currentCursor = null;
		} finally {
			loading = false;
			if (isInitialLoad) {
				initialLoadAttempted = true;
			}
			setupObserver();
		}
	}

	function setupObserver() {
		if (observer) {
			observer.disconnect();
			observer = null;
		}

		if (initialLoadAttempted && hasMore && !loading && loadMoreTrigger) {
			observer = new IntersectionObserver(
				(entries) => {
					if (entries[0].isIntersecting && currentCursor) {
						loadPosts(currentCursor);
					}
				},
				{ rootMargin: "300px", threshold: 0.01 }
			);
			observer.observe(loadMoreTrigger);
		}
	}

	$: if (loadMoreTrigger || hasMore || loading || initialLoadAttempted) {
		setupObserver();
	}

	onMount(() => {
		posts = [];
		currentCursor = null;
		hasMore = true;
		initialLoadAttempted = false;
		errorMessage = null;
		loading = false;
		loadPosts(null);
	});

	onDestroy(() => {
		if (observer) observer.disconnect();
	});
</script>

<div class="min-h-[60vh]">
	<!-- Skeleton Loader -->
	{#if loading && !initialLoadAttempted}
		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each Array(6) as _, i}
				<div
					class="card p-0 overflow-hidden animate-pulse"
					aria-hidden="true"
				>
					<div
						class="aspect-video bg-slate-200 dark:bg-slate-700"
					></div>
					<div class="p-6 space-y-3">
						<div
							class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20"
						></div>
						<div class="space-y-2">
							<div
								class="h-5 bg-slate-200 dark:bg-slate-700 rounded w-full"
							></div>
							<div
								class="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4"
							></div>
						</div>
						<div class="space-y-2">
							<div
								class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"
							></div>
							<div
								class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"
							></div>
						</div>
						<div
							class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"
						></div>
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Error Message -->
	{#if errorMessage && posts.length === 0}
		<div
			class="card bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-center"
			role="alert"
		>
			<AlertTriangle
				class="h-12 w-12 mx-auto mb-4 text-red-500 dark:text-red-400"
			/>
			<h3
				class="text-lg font-semibold text-red-800 dark:text-red-200 mb-2"
			>
				Could not load posts
			</h3>
			<p class="text-red-600 dark:text-red-300 mb-4">{errorMessage}</p>
			<button
				on:click={() => loadPosts(null)}
				class="btn btn-outline border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50"
			>
				Try again
			</button>
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
					in:fade={{ duration: 300, delay: (i % 6) * 50 }}
					class="group card p-0 overflow-hidden hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200"
				>
					<a href={`/post/${post.slug}`} class="block h-full">
						<!-- Image -->
						{#if coverImageUrl}
							<div
								class="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800"
							>
								<img
									src={coverImageUrl}
									alt={post.title}
									class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
									loading={i < 3 ? "eager" : "lazy"}
									decoding="async"
									fetchpriority={i < 3 ? "high" : "auto"}
									width="800"
									height="450"
								/>
							</div>
						{:else}
							<div
								class="relative aspect-video bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
							>
								<Image
									class="h-16 w-16 text-slate-400 dark:text-slate-500"
								/>
							</div>
						{/if}

						<!-- Content -->
						<div class="p-6 flex flex-col h-full">
							<time
								class="text-sm font-medium text-emerald-600 dark:text-emerald-400 block mb-2"
								datetime={post.publishedAt}
							>
								{formatDate(post.publishedAt)}
							</time>

							<h2
								class="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-200 line-clamp-2"
							>
								{post.title}
							</h2>

							{#if post.subtitle}
								<p
									class="text-slate-600 dark:text-slate-400 text-sm line-clamp-3 mb-4 flex-grow"
								>
									{post.subtitle}
								</p>
							{:else}
								<div class="mb-4 flex-grow"></div>
							{/if}

							<div
								class="flex items-center text-emerald-600 dark:text-emerald-400 text-sm font-medium mt-auto group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors duration-200"
							>
								Read article
								<ArrowRight
									class="ml-1 w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
								/>
							</div>
						</div>
					</a>
				</article>
			{/each}
		</div>
	{/if}

	<!-- Loading More -->
	{#if loading && initialLoadAttempted && posts.length > 0}
		<div class="flex justify-center py-8" aria-live="polite">
			<div class="relative h-8 w-8">
				<div
					class="absolute animate-spin rounded-full h-8 w-8 border-2 border-slate-200 dark:border-slate-700"
				></div>
				<div
					class="absolute animate-spin rounded-full h-8 w-8 border-2 border-emerald-600 dark:border-emerald-400 border-t-transparent"
				></div>
			</div>
		</div>
	{/if}

	<!-- End State -->
	{#if !loading && !hasMore && initialLoadAttempted}
		<div class="text-center py-8">
			{#if posts.length > 0}
				<div
					class="border-t border-slate-200 dark:border-slate-700 pt-6"
				>
					<p class="text-slate-500 dark:text-slate-400">
						You've reached the end of the posts
					</p>
				</div>
			{:else if !errorMessage}
				<div class="card text-center">
					<FileText
						class="h-12 w-12 mx-auto mb-3 text-slate-400 dark:text-slate-500"
					/>
					<p class="font-medium text-slate-900 dark:text-slate-100">
						No posts found
					</p>
					<p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
						Check back soon for new content
					</p>
				</div>
			{/if}
		</div>
	{/if}

	<!-- Intersection Observer Trigger -->
	{#if hasMore && initialLoadAttempted && !loading}
		<div bind:this={loadMoreTrigger} class="h-10 mt-8 invisible"></div>
	{/if}
</div>
