<!-- Search.svelte -->
<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { debounce } from "lodash-es";
	import type { HashnodePost } from "@/types/hashnode";

	let query = "";
	let results: HashnodePost[] = [];
	let isLoading = false;
	let hasSearched = false;
	let error: string | null = null;
	let abortController: AbortController | null = null;

	// Debounced search function
	const performSearch = debounce(async (searchQuery: string) => {
		if (abortController) {
			abortController.abort();
		}

		isLoading = true;
		hasSearched = true;
		error = null;

		if (!searchQuery.trim()) {
			results = [];
			isLoading = false;
			return;
		}

		try {
			abortController = new AbortController();
			const timeoutId = setTimeout(() => {
				if (abortController) abortController.abort();
			}, 5000);

			const response = await fetch(
				`/api/search?q=${encodeURIComponent(searchQuery)}`,
				{
					signal: abortController.signal,
					headers: {
						"Cache-Control": "no-cache",
						"If-None-Match":
							sessionStorage.getItem(
								`search-etag-${searchQuery}`
							) || "",
					},
				}
			);

			clearTimeout(timeoutId);

			// Handle 304 Not Modified
			if (response.status === 304) {
				const cachedResults = JSON.parse(
					sessionStorage.getItem(`search-results-${searchQuery}`) ||
						"[]"
				);
				results = cachedResults;
				isLoading = false;
				return;
			}

			if (!response.ok)
				throw new Error(`Search failed: ${response.statusText}`);

			const etag = response.headers.get("etag");
			if (etag) {
				sessionStorage.setItem(`search-etag-${searchQuery}`, etag);
			}

			const data = await response.json();
			if (data.error) throw new Error(data.message || "Search failed.");

			results = data;
			sessionStorage.setItem(
				`search-results-${searchQuery}`,
				JSON.stringify(data)
			);
		} catch (err: any) {
			if (err.name !== "AbortError") {
				console.error("Search error:", err);
				error =
					err instanceof Error ? err.message : "Unexpected error.";
				results = [];
			}
		} finally {
			isLoading = false;
		}
	}, 250);

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		query = target.value;
		performSearch(query);

		// Update URL with search query
		const url = new URL(window.location.href);
		if (query) {
			url.searchParams.set("q", query);
		} else {
			url.searchParams.delete("q");
		}
		window.history.replaceState({}, "", url.toString());
	}

	onMount(() => {
		const params = new URLSearchParams(window.location.search);
		const initialQuery = params.get("q") || "";
		query = initialQuery;
		if (initialQuery) performSearch(initialQuery);
	});

	onDestroy(() => {
		if (abortController) {
			abortController.abort();
		}
	});
</script>

<div class="w-full max-w-2xl mx-auto">
	<form on:submit|preventDefault class="mb-5">
		<div class="relative">
			<input
				type="text"
				bind:value={query}
				on:input={handleInput}
				placeholder="Search posts and projects..."
				class="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:ring-green-600 focus:border-green-600 transition shadow-sm text-sm"
				aria-label="Search posts"
			/>
			<!-- Magnifying Glass Icon -->
			<svg
				class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
				/>
			</svg>
		</div>
	</form>

	<div class="min-h-[200px]">
		{#if error}
			<div
				class="text-center text-red-500 py-3 bg-red-50 rounded-md border border-red-100 mb-4 text-sm"
				role="alert"
			>
				<p>{error}</p>
			</div>
		{/if}

		{#if isLoading}
			<div class="flex justify-center items-center h-48">
				<div class="text-center">
					<div
						class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] mb-3"
					></div>
					<p class="text-gray-600">Searching...</p>
				</div>
			</div>
		{:else if results.length > 0}
			<div class="grid gap-4 md:grid-cols-2">
				{#each results as post, index}
					<a
						href={`/post/${post.slug}`}
						class="group flex flex-col h-full bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-sm transition"
						style="animation-delay: {index * 50}ms"
					>
						<div class="p-4 flex flex-col h-full">
							<h2
								class="text-base font-display font-bold text-gray-900 mb-1.5 group-hover:text-green-700 transition"
							>
								{post.title}
							</h2>
							<p
								class="text-gray-600 text-sm line-clamp-2 mb-3 flex-grow"
							>
								{post.subtitle || post.brief}
							</p>
							<div class="flex items-center mt-auto">
								<div class="flex-1">
									<time class="text-xs text-gray-500">
										{new Date(
											post.publishedAt
										).toLocaleDateString("en-GB", {
											day: "numeric",
											month: "long",
											year: "numeric",
										})}
									</time>
								</div>
								<span
									class="text-green-700 flex items-center text-xs font-medium"
								>
									View post
									<!-- Arrow Right Icon -->
									<svg
										class="ml-1 w-3 h-3 transition transform group-hover:translate-x-0.5"
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
								</span>
							</div>
						</div>
					</a>
				{/each}
			</div>
		{:else if hasSearched && query}
			<div
				class="text-center py-8 bg-gray-50 rounded-md border border-gray-200"
			>
				<!-- Magnifying Glass Icon -->
				<svg
					class="mx-auto h-10 w-10 text-gray-400 mb-3"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="1.5"
						d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
					/>
				</svg>
				<p class="text-gray-600 text-base mb-1">No results found</p>
				<p class="text-gray-500 text-sm">
					Try different keywords or check spelling
				</p>
			</div>
		{/if}

		{#if !isLoading && !hasSearched}
			<div
				class="text-center py-8 bg-green-50 rounded-md border border-green-100"
			>
				<!-- Magnifying Glass Icon -->
				<svg
					class="mx-auto h-10 w-10 text-green-600 mb-3"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="1.5"
						d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
					/>
				</svg>
				<p class="text-gray-700 text-base mb-1">
					Looking for something?
				</p>
				<p class="text-gray-600 text-sm">
					Type above to search through blog posts and projects
				</p>
			</div>
		{/if}
	</div>
</div>
