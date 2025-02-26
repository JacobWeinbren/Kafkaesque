// src/components/search/Search.tsx
import { useState, useEffect, useCallback, useRef } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import debounce from "lodash/debounce";
import type { HashnodePost } from "@/types/hashnode";

export default function Search() {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<HashnodePost[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [hasSearched, setHasSearched] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const abortController = useRef<AbortController | null>(null);

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const initialQuery = params.get("q") || "";
		setQuery(initialQuery);
		if (initialQuery) performSearch(initialQuery);

		return () => {
			abortController.current?.abort();
		};
	}, []);

	const performSearch = useCallback(
		debounce(async (searchQuery: string) => {
			abortController.current?.abort();
			setIsLoading(true);
			setHasSearched(true);
			setError(null);

			if (!searchQuery.trim()) {
				setResults([]);
				setIsLoading(false);
				return;
			}

			try {
				abortController.current = new AbortController();
				const timeoutId = setTimeout(() => {
					abortController.current?.abort();
				}, 5000);

				const response = await fetch(
					`/api/search?q=${encodeURIComponent(searchQuery)}`,
					{
						signal: abortController.current.signal,
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
						sessionStorage.getItem(
							`search-results-${searchQuery}`
						) || "[]"
					);
					setResults(cachedResults);
					setIsLoading(false);
					return;
				}

				if (!response.ok)
					throw new Error(`Search failed: ${response.statusText}`);

				const etag = response.headers.get("etag");
				if (etag) {
					sessionStorage.setItem(`search-etag-${searchQuery}`, etag);
				}

				const data = await response.json();
				if (data.error)
					throw new Error(data.message || "Search failed.");

				setResults(data);
				sessionStorage.setItem(
					`search-results-${searchQuery}`,
					JSON.stringify(data)
				);
			} catch (err: any) {
				if (err.name !== "AbortError") {
					console.error("Search error:", err);
					setError(
						err instanceof Error ? err.message : "Unexpected error."
					);
					setResults([]);
				}
			} finally {
				setIsLoading(false);
			}
		}, 300),
		[]
	);

	return (
		<div className="w-full max-w-4xl mx-auto px-4">
			<form onSubmit={(e) => e.preventDefault()} className="mb-6">
				<div className="relative">
					<input
						type="text"
						value={query}
						onChange={(e) => {
							setQuery(e.target.value);
							performSearch(e.target.value);

							// Update URL with search query
							const url = new URL(window.location.href);
							if (e.target.value) {
								url.searchParams.set("q", e.target.value);
							} else {
								url.searchParams.delete("q");
							}
							window.history.replaceState({}, "", url.toString());
						}}
						placeholder="Search posts..."
						className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition shadow-sm"
						aria-label="Search posts"
					/>
					<MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
				</div>
			</form>
			<div className="min-h-[200px]">
				{error && (
					<div
						className="text-center text-red-500 py-4 bg-red-50 rounded-lg border border-red-100 mb-6"
						role="alert"
					>
						<p>{error}</p>
					</div>
				)}

				{isLoading ? (
					<div className="grid gap-6 md:grid-cols-2">
						{[1, 2, 3, 4].map((i) => (
							<div
								key={i}
								className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm animate-pulse"
							>
								<div className="h-40 bg-gray-200"></div>
								<div className="p-6">
									<div className="h-4 w-1/4 bg-gray-200 rounded mb-4"></div>
									<div className="h-6 bg-gray-200 rounded mb-2"></div>
									<div className="h-6 w-3/4 bg-gray-200 rounded mb-4"></div>
									<div className="h-4 bg-gray-200 rounded"></div>
								</div>
							</div>
						))}
					</div>
				) : results.length > 0 ? (
					<div className="grid gap-6 md:grid-cols-2">
						{results.map((post, index) => (
							<a
								key={post.id}
								href={`/post/${post.slug}`}
								className="group flex flex-col h-full bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-md transition transform hover:-translate-y-1"
								style={{ animationDelay: `${index * 50}ms` }}
							>
								<div className="p-6 flex flex-col h-full">
									<h2 className="text-xl font-display font-bold text-gray-900 mb-2 group-hover:text-green-600 transition">
										{post.title}
									</h2>
									<p className="text-gray-600 line-clamp-3 mb-3 flex-grow">
										{post.subtitle || post.brief}
									</p>
									<div className="flex items-center mt-auto">
										<div className="flex-1">
											<time className="text-sm text-gray-500">
												{new Date(
													post.publishedAt
												).toLocaleDateString("en-GB", {
													day: "numeric",
													month: "long",
													year: "numeric",
												})}
											</time>
										</div>
										<span className="text-green-600 flex items-center text-sm font-medium">
											View post
											<svg
												className="ml-1 w-4 h-4 transition group-hover:translate-x-1"
												viewBox="0 0 20 20"
												fill="currentColor"
											>
												<path
													fillRule="evenodd"
													d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
													clipRule="evenodd"
												/>
											</svg>
										</span>
									</div>
								</div>
							</a>
						))}
					</div>
				) : (
					hasSearched &&
					query && (
						<div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
							<svg
								className="mx-auto h-12 w-12 text-gray-400 mb-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={1.5}
									d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<p className="text-gray-600 text-lg mb-2">
								No results found
							</p>
							<p className="text-gray-500 text-sm">
								Try using different keywords or check your
								spelling
							</p>
						</div>
					)
				)}

				{!isLoading && !hasSearched && (
					<div className="text-center py-12 bg-green-50 rounded-lg border border-green-100">
						<MagnifyingGlassIcon className="mx-auto h-12 w-12 text-green-500 mb-4" />
						<p className="text-gray-700 text-lg mb-2">
							Looking for something?
						</p>
						<p className="text-gray-600 text-sm">
							Type above to search through blog posts and projects
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
