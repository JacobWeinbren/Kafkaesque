import React from "react";

interface SearchResult {
	title: string;
	excerpt: string;
	published_at: string;
	feature_image: string;
	slug: string;
}

interface SearchResultsTableProps {
	results: SearchResult[];
}

const SearchResultsTable: React.FC<SearchResultsTableProps> = ({ results }) => {
	return (
		<div className="grid gap-6 mt-8 md:grid-cols-2">
			{results.map((result) => (
				<a
					href={`/post/${result.slug}`}
					className="no-underline transition-transform group"
					key={result.slug}
				>
					<div className="flex flex-col h-full overflow-hidden border rounded-lg shadow-sm hover:shadow-md">
						<img
							src={result.feature_image}
							alt={`Featured for ${result.title}`}
							className="object-cover w-full h-48"
						/>
						<div className="flex flex-col justify-between flex-grow p-4 space-y-2">
							<h3 className="text-xl font-semibold">
								{result.title}
							</h3>
							<p className="text-sm text-gray-200 line-clamp-2">
								{result.excerpt}
							</p>
							<p className="text-xs text-gray-300">
								{new Date(
									result.published_at
								).toLocaleDateString("en-UK", {
									year: "numeric",
									month: "long",
									day: "numeric",
								})}
							</p>
						</div>
					</div>
				</a>
			))}
		</div>
	);
};

export default SearchResultsTable;
