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
		} catch (err: unknown) {
			if (err instanceof Error && err.name !== "AbortError") {
				console.error("Search error:", err);
				error =
					err.message ||
					"An unexpected error occurred during search.";
				results = [];
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

	function clearSearch() {
		query = "";
		results = [];
		hasSearched = false;
		error = null;
		inputRef?.focus();

		const url = new URL($page.url);
		url.searchParams.delete("q");
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
	<!-- Search Form -->
	<form on:submit|preventDefault class="mb-8 relative" role="search">
		<div class="relative">
			<input
				type="search"
				bind:value={query}
				bind:this={inputRef}
				on:input={handleInput}
				placeholder="Search posts and projects..."
				class="w-full px-4 py-3 pl-12 pr-12 form-input text-lg"
				aria-label="Search posts and projects"
			/>

			<div
				class="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none"
			>
				<Search class="w-5 h-5" />
			</div>

			{#if query && !isLoading}
				<button
					type="button"
					class="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors duration-200"
					on:click={clearSearch}
				>
					<span class="sr-only">Clear search</span>
					<X class="w-5 h-5" />
				</button>
			{/if}

			{#if isLoading}
				<div
					class="absolute right-4 top-1/2 transform -translate-y-1/2"
				>
					<div
						class="w-5 h-5 border-2 border-slate-300 dark:border-slate-600 border-t-emerald-600 dark:border-t-emerald-400 rounded-full animate-spin"
					></div>
				</div>
			{/if}
		</div>
	</form>

	<!-- Results -->
	<div class="min-h-[300px]">
		{#if error}
			<div
				class="card bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-center"
				role="alert"
			>
				<AlertCircle
					class="h-8 w-8 mx-auto mb-3 text-red-500 dark:text-red-400"
				/>
				<p class="font-medium text-red-800 dark:text-red-200 mb-2">
					Search Error
				</p>
				<p class="text-red-600 dark:text-red-300 text-sm">{error}</p>
			</div>
		{/if}

		{#if !isLoading && results.length > 0}
			<div class="space-y-4">
				<p class="text-sm text-slate-600 dark:text-slate-400 mb-4">
					Found {results.length} result{results.length !== 1
						? "s"
						: ""}
				</p>

				{#each results as post, index (post.id)}
					<a
						href={`/post/${post.slug}`}
						class="block card hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 group"
						in:fade={{ duration: 200, delay: index * 50 }}
					>
						<div class="flex flex-col">
							<h3
								class="font-semibold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-200"
							>
								{post.title}
							</h3>

							{#if post.subtitle || post.brief}
								<p
									class="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 mb-3"
								>
									{post.subtitle || post.brief}
								</p>
							{/if}

							<div
								class="flex items-center justify-between mt-auto"
							>
								<time
									class="text-xs text-slate-500 dark:text-slate-400"
									datetime={post.publishedAt}
								>
									{formatResultDate(post.publishedAt)}
								</time>
								<div
									class="flex items-center text-emerald-600 dark:text-emerald-400 text-sm font-medium group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors duration-200"
								>
									View post
									<ArrowRight
										class="ml-1 w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5"
									/>
								</div>
							</div>
						</div>
					</a>
				{/each}
			</div>
		{:else if !isLoading && hasSearched && query.trim()}
			<div class="card text-center">
				<Search
					class="h-12 w-12 mx-auto mb-4 text-slate-400 dark:text-slate-500"
				/>
				<p class="font-medium text-slate-900 dark:text-slate-100 mb-2">
					No results found
				</p>
				<p class="text-slate-600 dark:text-slate-400 text-sm mb-4">
					Try different keywords or check spelling
				</p>
				<button on:click={clearSearch} class="btn btn-secondary">
					Clear search
				</button>
			</div>
		{:else if !isLoading && !hasSearched}
			<div
				class="card bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-center"
			>
				<Search
					class="h-12 w-12 mx-auto mb-4 text-emerald-600 dark:text-emerald-400"
				/>
				<p class="font-medium text-slate-900 dark:text-slate-100 mb-2">
					Search for content
				</p>
				<p class="text-slate-600 dark:text-slate-400 text-sm">
					Find articles, projects, and insights
				</p>
			</div>
		{/if}
	</div>
</div>
