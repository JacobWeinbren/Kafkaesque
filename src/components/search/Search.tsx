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
						headers: { "Cache-Control": "no-cache" },
					}
				);
				clearTimeout(timeoutId);
				if (!response.ok)
					throw new Error(`Search failed: ${response.statusText}`);
				const data = await response.json();
				if (data.error)
					throw new Error(data.message || "Search failed.");
				setResults(data);
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
						}}
						placeholder="Search posts..."
						className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 transition"
						aria-label="Search posts"
					/>
					<MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
				</div>
			</form>
			<div className="min-h-[200px]">
				{error && (
					<div className="text-center text-red-500 py-4" role="alert">
						<p>{error}</p>
					</div>
				)}
				{isLoading ? (
					<div className="flex justify-center py-8">
						<div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-green-600" />
					</div>
				) : results.length > 0 ? (
					<div className="grid gap-6 md:grid-cols-2">
						{results.map((post) => (
							<a
								key={post.id}
								href={`/post/${post.slug}`}
								className="group block rounded-xl border border-gray-200 hover:border-green-500 hover:shadow-md transition transform hover:-translate-y-1"
							>
								<div className="p-6">
									<h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition">
										{post.title}
									</h2>
									<p className="text-gray-600 line-clamp-3">
										{post.subtitle || post.brief}
									</p>
									<time className="block mt-4 text-sm text-gray-500">
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
						<div className="text-center text-gray-500 py-8">
							No results found
						</div>
					)
				)}
			</div>
		</div>
	);
}
