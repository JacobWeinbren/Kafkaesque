import { useEffect, useState } from "react";
import SearchResultsTable from "@/components/SearchResultsTable";
import { Input } from "@nextui-org/react";

const Search = () => {
	const [results, setResults] = useState([]);
	const [query, setQuery] = useState("");

	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const initialQuery = urlParams.get("query") || "";
		setQuery(initialQuery);
		performSearch(initialQuery);
	}, []);

	const performSearch = async (query) => {
		const response = await fetch(
			`/api/search?query=${encodeURIComponent(query)}`
		);
		const data = await response.json();
		setResults(data);
	};

	const updateUrlQuery = (newQuery) => {
		const newUrl = new URL(window.location.href);
		newUrl.searchParams.set("query", newQuery);
		window.history.pushState({}, "", newUrl.toString());
	};

	const handleInputChange = (e) => {
		const newQuery = e.target.value;
		setQuery(newQuery);
		updateUrlQuery(newQuery);
		performSearch(newQuery);
	};

	return (
		<div>
			<Input
				type="text"
				id="search-input"
				variant="bordered"
				value={query}
				onChange={handleInputChange}
				className="w-full border rounded"
				placeholder="Search for a blog post"
			/>
			<SearchResultsTable results={results} />
		</div>
	);
};

export default Search;
