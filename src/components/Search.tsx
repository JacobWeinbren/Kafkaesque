// src/components/Search.tsx
import { useState, useEffect, useCallback } from "react";
import { Search as SearchIcon } from "lucide-react";
import debounce from "lodash/debounce";
import type { Post } from "@ts-ghost/content-api";

export default function Search() {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<Post[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [hasSearched, setHasSearched] = useState(false);

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

			if (!searchQuery.trim()) {
				setResults([]);
				setIsLoading(false);
				return;
			}

			try {
				const response = await fetch(
					`/api/search?q=${encodeURIComponent(searchQuery)}`
				);
				const data = await response.json();
				setResults(data);
			} catch (error) {
				console.error("Search error:", error);
			} finally {
				setIsLoading(false);
			}
		}, 300),
		[]
	);

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		performSearch(query);
		const newUrl = new URL(window.location.href);
		newUrl.searchParams.set("q", query);
		window.history.pushState({}, "", newUrl);
	};

	return (
		<div className="w-full max-w-4xl mx-auto px-4">
			<form onSubmit={handleSearch} className="mb-8">
				<div className="relative">
					<input
						type="text"
						value={query}
						onChange={(e) => {
							setQuery(e.target.value);
							performSearch(e.target.value);
						}}
						className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
						placeholder="Search posts..."
					/>
					<SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
				</div>
			</form>

			<div className="min-h-[200px]">
				{isLoading ? (
					<div className="text-center py-8 text-gray-500">
						Searching...
					</div>
				) : results.length > 0 ? (
					<div className="grid gap-6 md:grid-cols-2">
						{results.map((result) => (
							<a
								key={result.slug}
								href={`/post/${result.slug}`}
								className="block bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:border-green-500"
							>
								<div className="p-6">
									<h2 className="font-bold text-xl mb-2">
										{result.title}
									</h2>
									<p className="text-gray-600 line-clamp-3">
										{result.excerpt}
									</p>
									<time className="text-sm text-gray-500 mt-4 block">
										{new Date(
											result.published_at
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
				) : hasSearched && query ? (
					<div className="text-center py-8 text-gray-500">
						No results found
					</div>
				) : null}
			</div>
		</div>
	);
}
