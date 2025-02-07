// src/components/Search.tsx
import { useState, useEffect, useCallback } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import debounce from "lodash/debounce";
import type { HashnodePost } from "@/types/hashnode";

export default function Search() {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<HashnodePost[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [hasSearched, setHasSearched] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const initialQuery = params.get("q") || "";
		setQuery(initialQuery);
		if (initialQuery) {
			performSearch(initialQuery);
		}
	}, []);

	const performSearch = useCallback(
		debounce(async (searchQuery: string) => {
			setIsLoading(true);
			setHasSearched(true);
			setError(null);

			if (!searchQuery.trim()) {
				setResults([]);
				setIsLoading(false);
				return;
			}

			try {
				const controller = new AbortController();
				const timeoutId = setTimeout(() => controller.abort(), 5000);

				const response = await fetch(
					`/api/search?q=${encodeURIComponent(searchQuery)}`,
					{
						signal: controller.signal,
						headers: {
							"Cache-Control": "no-cache",
						},
					}
				);

				clearTimeout(timeoutId);

				if (!response.ok) {
					throw new Error(`Search failed: ${response.statusText}`);
				}

				const data = await response.json();
				if (data.error) {
					throw new Error(data.message || "Search failed");
				}

				setResults(data);
			} catch (error) {
				console.error("Search error:", error);
				setError(
					error instanceof Error
						? error.message
						: "An unexpected error occurred"
				);
				setResults([]);
			} finally {
				setIsLoading(false);
			}
		}, 300),
		[]
	);

	useEffect(() => {
		return () => {
			performSearch.cancel();
		};
	}, [performSearch]);

	return (
		<div className="w-full max-w-4xl mx-auto px-4">
			<form onSubmit={(e) => e.preventDefault()} className="mb-8">
				<div className="relative">
					<input
						type="text"
						value={query}
						onChange={(e) => {
							setQuery(e.target.value);
							performSearch(e.target.value);
						}}
						className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-lg 
                     focus:border-green-500 focus:ring-2 focus:ring-green-500/20 
                     focus:outline-none transition-all duration-150"
						placeholder="Search posts..."
					/>
					<MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
				</div>
			</form>

			<div className="min-h-[200px]">
				{error && (
					<div className="text-center py-4 text-red-500">
						<p>{error}</p>
					</div>
				)}

				{isLoading ? (
					<div className="flex justify-center py-8">
						<div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-green-500"></div>
					</div>
				) : results.length > 0 ? (
					<div className="grid gap-6 md:grid-cols-2">
						{results.map((post) => (
							<a
								key={post.id}
								href={`/post/${post.slug}`}
								className="group bg-white rounded-xl overflow-hidden border border-gray-100 
                          hover:border-green-500 hover:shadow-md transition-all duration-150"
							>
								<div className="p-6">
									<h2
										className="font-bold text-xl mb-2 group-hover:text-green-600 
                              transition-colors duration-150"
									>
										{post.title}
									</h2>
									<p className="text-gray-600 line-clamp-3">
										{post.subtitle || post.brief}
									</p>
									<time className="text-sm text-gray-500 mt-4 block">
										{new Date(
											post.publishedAt
										).toLocaleDateString("en-GB", {
											day: "numeric",
											month: "long",
											year: "numeric",
										})}
									</time>
								</div>
							</a>
						))}
					</div>
				) : (
					hasSearched &&
					query && (
						<div className="text-center py-8 text-gray-500">
							No results found
						</div>
					)
				)}
			</div>
		</div>
	);
}
