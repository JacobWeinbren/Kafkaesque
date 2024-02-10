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
		<div className="grid gap-4 mt-8 md:grid-cols-2">
			{results.map((result) => (
				<a
					href={`/post/${result.slug}`}
					className="no-underline group"
					key={result.slug}
					style={{ display: "grid" }}
				>
					<div className="flex items-center p-4 border rounded">
						<img
							src={result.feature_image}
							alt={`Featured for ${result.title}`}
							width={100}
							height={100}
							className="object-cover h-48 mr-6 rounded-md w-36 min-w-36 min-h-48"
						/>
						<div className="flex flex-col justify-between gap-1">
							<p>{result.title}</p>
							<p className="font-normal">{result.excerpt}</p>
							<p className="text-muted-foreground">
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
