import React from "react";

interface SearchResult {
	title: string;
	excerpt: string;
	published_at: string;
	slug: string;
}

interface SearchResultsTableProps {
	results: SearchResult[];
	isLoading: boolean;
}

const getRandomColor = (seed: string) => {
	const colors = [
		"bg-blue-500",
		"bg-green-500",
		"bg-yellow-500",
		"bg-red-500",
		"bg-indigo-500",
		"bg-purple-500",
		"bg-pink-500",
		"bg-teal-500",
	];
	const index =
		seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
		colors.length;
	return colors[index];
};

const SearchResultsTable: React.FC<SearchResultsTableProps> = ({
	results,
	isLoading,
}) => {
	if (isLoading) {
		return (
			<div className="mt-8 text-center text-gray-500 text-xl">
				Loading...
			</div>
		);
	}

	if (results.length === 0) {
		return (
			<div className="mt-8 text-center text-gray-500 text-xl">
				No results found.
			</div>
		);
	}

	return (
		<div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
			{results.map((result) => (
				<a
					href={`/post/${result.slug}`}
					className="block no-underline transition-transform hover:scale-105"
					key={result.slug}
				>
					<div
						className={`p-6 rounded-lg h-64 flex flex-col justify-between ${getRandomColor(
							result.slug
						)}`}
					>
						<div>
							<h3 className="text-xl font-bold text-white mb-2">
								{result.title}
							</h3>
							<p className="text-sm text-white/80 mb-2 line-clamp-3">
								{result.excerpt}
							</p>
						</div>
						<p className="text-xs text-white/60">
							{new Date(result.published_at).toLocaleDateString(
								"en-UK",
								{
									year: "numeric",
									month: "long",
									day: "numeric",
								}
							)}
						</p>
					</div>
				</a>
			))}
		</div>
	);
};

export default SearchResultsTable;
