<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { debounce } from "lodash-es";
	import { page } from "$app/stores";
	import { goto } from "$app/navigation";
	import { fade } from "svelte/transition";
	import { Search, X, ArrowRight, AlertCircle } from "lucide-svelte";

	interface SearchResult {
		id: string;
		slug: string;
		title: string;
		subtitle?: string;
		brief?: string;
		publishedAt: string;
	}

	let query = "";
	let results: SearchResult[] = [];
	let isLoading = false;
	let hasSearched = false;
	let error: string | null = null;
	let abortController: AbortController | null = null;
	let inputRef: HTMLInputElement;

	const performSearch = debounce(async (searchQuery: string) => {
		if (abortController) {
			abortController.abort();
		}

		isLoading = true;
		hasSearched = true;
		error = null;
		results = [];

		const trimmedQuery = searchQuery.trim();

		if (!trimmedQuery) {
			isLoading = false;
			return;
		}

		try {
			abortController = new AbortController();
			const searchUrl = `/api/search?q=${encodeURIComponent(trimmedQuery)}`;

			const timeoutId = setTimeout(
				() => abortController?.abort("Timeout"),
				8000
			);

			const response = await fetch(searchUrl, {
				signal: abortController.signal,
				headers: {
					"Cache-Control": "no-cache",
				},
			});

			clearTimeout(timeoutId);

			if (response.status === 304) {
				console.log("Search: Received 304 Not Modified");
				isLoading = false;
				return;
			}

			if (!response.ok) {
				let errorMsg = `Search failed: ${response.statusText}`;
				try {
					const errData = await response.json();
					errorMsg = errData.message || errData.error || errorMsg;
				} catch (_) {
					/* ignore json parsing error */
				}
				throw new Error(errorMsg);
			}

			const data = await response.json();

			if (data.error) {
				throw new Error(data.message || data.error || "Search failed.");
			}

			if (Array.isArray(data)) {
				results = data as SearchResult[];
			} else {
				console.warn("Unexpected search API response structure:", data);
				results = [];
			}
		} catch (err: any) {
			if (err.name !== "AbortError") {
				console.error("Search error:", err);
				error =
					err.message ||
					"An unexpected error occurred during search.";
				results = [];
			} else {
				console.log("Search request aborted.");
			}
		} finally {
			isLoading = false;
			abortController = null;
		}
	}, 300);

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		query = target.value;
		performSearch(query);

		const url = new URL($page.url);
		if (query.trim()) {
			url.searchParams.set("q", query.trim());
		} else {
			url.searchParams.delete("q");
		}
		goto(url.toString(), {
			replaceState: true,
			keepFocus: true,
			noScroll: true,
		});
	}

	onMount(() => {
		const initialQuery = $page.url.searchParams.get("q") || "";
		query = initialQuery;
		if (initialQuery) {
			hasSearched = true;
			performSearch(initialQuery);
		}

		// Focus the search input on load
		if (inputRef) {
			setTimeout(() => inputRef.focus(), 100);
		}
	});

	onDestroy(() => {
		if (abortController) {
			abortController.abort();
		}
		performSearch.cancel();
	});

	function formatResultDate(dateString: string): string {
		try {
			return new Date(dateString).toLocaleDateString("en-GB", {
				day: "numeric",
				month: "short",
				year: "numeric",
			});
		} catch {
			return "Invalid Date";
		}
	}
</script>

<div class="w-full max-w-2xl mx-auto">
	<form on:submit|preventDefault class="mb-6 relative" role="search">
		<div class="relative">
			<input
				type="search"
				bind:value={query}
				bind:this={inputRef}
				on:input={handleInput}
				placeholder="Search posts and projects..."
				class="w-full px-4 py-3 pl-12 border border-slate-200 rounded-xl focus:ring-green-500 focus:border-green-500 transition shadow-xs text-slate-800 placeholder-slate-400"
				aria-label="Search posts and projects"
			/>
			<div
				class="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none"
			>
				<Search class="w-5 h-5" />
			</div>

			{#if query && !isLoading}
				<button
					type="button"
					class="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
					on:click={() => {
						query = "";
						results = [];
						hasSearched = false;
					}}
				>
					<span class="sr-only">Clear search</span>
					<X class="w-5 h-5" />
				</button>
			{/if}
		</div>
	</form>

	<div class="min-h-[300px] relative">
		{#if error}
			<div
				in:fade={{ duration: 200 }}
				class="text-center text-red-600 py-4 px-6 bg-red-50 rounded-xl border border-red-100 mb-4"
				role="alert"
			>
				<AlertCircle class="h-5 w-5 inline-block mr-1 mb-0.5" />
				<span>{error}</span>
			</div>
		{/if}

		{#if isLoading}
			<div
				in:fade={{ duration: 200 }}
				class="absolute inset-0 flex justify-center items-center bg-white/60 backdrop-blur-sm-sm z-10 rounded-xl"
			>
				<div class="text-center">
					<div class="relative h-12 w-12 mx-auto mb-2">
						<div
							class="absolute animate-spin rounded-full h-12 w-12 border-4 border-slate-200"
						></div>
						<div
							class="absolute animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"
						></div>
					</div>
					<p class="text-slate-600">Searching...</p>
				</div>
			</div>
		{/if}

		{#if !isLoading && results.length > 0}
			<div class="grid gap-4 md:grid-cols-2">
				{#each results as post, index (post.id)}
					<a
						href={`/blog/post/${post.slug}`}
						class="group flex flex-col h-full bg-white rounded-xl border border-slate-100 hover:border-green-200 hover:shadow transition-all duration-300 animate-fade-in-fast"
						style="animation-delay: {index * 50}ms"
						in:fade={{ duration: 300, delay: index * 50 }}
					>
						<div class="p-5 flex flex-col h-full">
							<h2
								class="text-lg font-display font-semibold text-slate-800 mb-2 group-hover:text-green-600 transition line-clamp-2"
							>
								{post.title}
							</h2>
							{#if post.subtitle || post.brief}
								<p
									class="text-slate-600 text-sm line-clamp-2 mb-3 flex-grow"
								>
									{post.subtitle || post.brief}
								</p>
							{/if}
							<div
								class="flex items-center mt-auto pt-3 border-t border-slate-100"
							>
								<div class="flex-1">
									<time
										class="text-xs text-slate-500"
										datetime={post.publishedAt}
									>
										{formatResultDate(post.publishedAt)}
									</time>
								</div>
								<span
									class="text-green-600 flex items-center text-xs font-medium group-hover:text-green-700 transition"
								>
									View post
									<ArrowRight
										class="ml-1 w-3.5 h-3.5 transition transform group-hover:translate-x-0.5"
									/>
								</span>
							</div>
						</div>
					</a>
				{/each}
			</div>
		{:else if !isLoading && hasSearched && query.trim()}
			<div
				in:fade={{ duration: 200 }}
				class="text-center py-12 bg-slate-50 rounded-xl border border-slate-100"
			>
				<Search class="h-16 w-16 mx-auto mb-4 text-slate-300" />
				<p class="text-slate-700 text-lg font-medium mb-1">
					No results found
				</p>
				<p class="text-slate-500 text-sm max-w-md mx-auto">
					Try different keywords, check spelling, or consider broader
					terms
				</p>
			</div>
		{:else if !isLoading && !hasSearched}
			<div
				in:fade={{ duration: 200 }}
				class="text-center py-12 bg-green-50 rounded-xl border border-green-100"
			>
				<Search class="h-16 w-16 mx-auto mb-4 text-green-300" />
				<p class="text-slate-800 text-lg font-medium mb-1">
					Looking for something?
				</p>
				<p class="text-slate-600 text-sm max-w-md mx-auto">
					Type above to search through blog posts, projects, and more
				</p>
			</div>
		{/if}
	</div>
</div>
