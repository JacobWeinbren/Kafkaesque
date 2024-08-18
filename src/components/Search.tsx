import { useEffect, useState, useCallback } from "react";
import SearchResultsTable from "@/components/SearchResultsTable";
import { Search as SearchIcon } from "lucide-react";
import debounce from "lodash/debounce";

const Search = () => {
	const [results, setResults] = useState([]);
	const [query, setQuery] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const initialQuery = urlParams.get("query") || "";
		setQuery(initialQuery);
		performSearch(initialQuery);
	}, []);

	const performSearch = async (query) => {
		setIsLoading(true);
		const response = await fetch(
			`/api/search?query=${encodeURIComponent(query)}`
		);
		const data = await response.json();
		setResults(data);
		setIsLoading(false);
	};

	const updateUrlQuery = (newQuery) => {
		const newUrl = new URL(window.location.href);
		newUrl.searchParams.set("query", newQuery);
		window.history.pushState({}, "", newUrl.toString());
	};

	const debouncedSearch = useCallback(
		debounce((query) => {
			performSearch(query);
			updateUrlQuery(query);
		}, 300),
		[]
	);

	const handleInputChange = (e) => {
		const newQuery = e.target.value;
		setQuery(newQuery);
		debouncedSearch(newQuery);
	};

	return (
		<div className="flex flex-col items-center">
			<div className="relative w-96 max-w-2xl mb-8">
				<input
					type="text"
					id="search-input"
					value={query}
					onChange={handleInputChange}
					className="w-96 py-3 pl-12 pr-4 text-gray-700 bg-white border-2 border-gray-300 rounded-2xl focus:outline-none focus:border-green-500"
					placeholder="Search for a blog post"
				/>
				<div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
					<SearchIcon className="w-6 h-6 text-gray-500" />
				</div>
			</div>
			<div className="w-full max-w-2xl">
				<SearchResultsTable results={results} isLoading={isLoading} />
			</div>
		</div>
	);
};

export default Search;
