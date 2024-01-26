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
		<div className="grid gap-4 md:grid-cols-2">
			{results.map((result) => (
				<a
					href={`/post/${result.slug}`}
					className="group"
					key={result.slug}
					style={{ display: "grid" }}
				>
					<div className="flex border p-4 items-center">
						<img
							src={result.feature_image}
							alt={`Featured for ${result.title}`}
							width={80}
							height={80}
							className="min-w-[60px] w-[60px] h-[60px] rounded-md object-cover mr-4"
						/>
						<div className="flex flex-col justify-between">
							<p className="text-sm">{result.title}</p>
							<p className="text-xs">{result.excerpt}</p>
							<p className="text-xs text-muted-foreground">
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
