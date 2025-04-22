<script lang="ts">
	import type { PageData } from "./$types";
	import {
		Map,
		BarChart2,
		Newspaper,
		GraduationCap,
		Presentation,
		FileText,
		ArrowRight,
		Download,
	} from "lucide-svelte";
	import type { ComponentType } from "svelte";

	export let data: PageData;

	interface Project {
		title: string;
		description: string[];
		icon: ComponentType;
		date: string;
		link: string;
		image: string;
	}

	const projects: Project[] = [
		{
			title: "UK General Election Visualisation",
			description: [
				"Engineered an advanced interactive visualisation implementing ecological regression analysis to reveal correlations between deprivation indices and voting patterns across constituencies.",
				"Received recognition from prominent political analysts including Financial Times Political Editor Stephen Bush and Professor Rob Ford.",
			],
			icon: Map,
			date: "2024-07",
			link: "https://kafkaesque.blog/post/deprivation-and-the-2024-ge",
			image: "/images/projects/uk-election.jpg",
		},
		{
			title: "Canadian Census Data Explorer",
			description: [
				"Developed a high-performance web application visualising comprehensive census data across 2.5 million buildings with thousands of demographic variables.",
				"Implemented Redis as a map tile server with optimised JavaScript frontend, achieving near-instantaneous rendering of complex spatial datasets and earning recognition from MountainMath CEO Dr. Bergmann.",
			],
			icon: BarChart2,
			date: "2024-06",
			link: "https://github.com/JacobWeinbren/Canadian-Census",
			image: "/images/projects/canada-census.jpg",
		},
		{
			title: "Parliamentary Campaign Website",
			description: [
				"Engineered a bespoke, responsive campaign website for a UK parliamentary candidate using SvelteKit and modern web techniques.",
				"Optimised performance, accessibility and SEO metrics while ensuring strict compliance with political party branding guidelines and cross-device compatibility.",
			],
			icon: Newspaper,
			date: "2024-06",
			link: "https://github.com/JacobWeinbren/Emily4MK",
			image: "/images/projects/campaign-site.jpg",
		},
		{
			title: "Hebrew Learning Platform",
			description: [
				"Coordinated an international team to develop an educational platform combining interactive flashcards with neural transliteration algorithms for Hebrew language acquisition.",
				"Implemented over 4,000 interactive cards and automated transliteration systems, substantially improving language accessibility for English speakers.",
			],
			icon: GraduationCap,
			date: "2024-01",
			link: "https://kafkaesque.blog/post/complete-duolingo-hebrew-set",
			image: "/images/projects/hebrew-learning.jpg",
		},
		{
			title: "Israeli Elections Analysis",
			description: [
				"Designed a comprehensive interactive mapping platform for B'nai Brith analysing Israeli election results with demographic and geographic context.",
				"Incorporated responsive cartographic design and statistical analysis to reveal socio-political trends across multiple election cycles, earning recognition from Professor Matthew Shugart.",
			],
			icon: Presentation,
			date: "2022-06",
			link: "https://kafkaesque.blog/post/updated-israel-map",
			image: "/images/projects/israel-elections.jpg",
		},
		{
			title: "Technical Blog & Portfolio",
			description: [
				"Architected this high-performance, accessible personal website using SvelteKit and Tailwind CSS, showcasing technical writing and project work.",
				"Implemented optimised loading strategies, responsive design patterns, and a custom search implementation to enhance content discovery and user experience.",
			],
			icon: FileText,
			date: "2022-05",
			link: "https://github.com/JacobWeinbren/Kafkaesque",
			image: "/images/projects/portfolio.jpg",
		},
	].sort((a, b) => (a.date < b.date ? 1 : -1));
</script>

<svelte:head>
	<title>Portfolio – Jacob Weinbren</title>
	<meta
		name="description"
		content="Advanced projects in geospatial analysis, data visualisation and web development."
	/>
	{#if data.url}
		<link rel="canonical" href={data.url.href} />
		<meta property="og:url" content={data.url.href} />
	{/if}
	<meta property="og:title" content="Portfolio – Jacob Weinbren" />
	<meta
		property="og:description"
		content="Advanced projects in geospatial analysis, data visualisation and web development."
	/>
	<meta property="og:type" content="website" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<!-- Header Section -->
<section class="relative overflow-hidden">
	<div
		class="absolute inset-0 bg-gradient-to-br from-green-800 via-green-700 to-green-600"
	></div>
	<div
		class="absolute inset-0 opacity-10"
		style="background-image: url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.2\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"
	></div>
	<div class="relative max-w-5xl mx-auto px-4 py-20 text-center">
		<h1 class="text-4xl md:text-5xl font-bold text-white mb-4 font-display">
			Project Portfolio
		</h1>
		<p class="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
			Specialised work in geospatial analysis, data visualisation, and
			full-stack web development
		</p>
	</div>
</section>

<!-- Projects Grid -->
<section class="py-16 bg-white">
	<div class="max-w-6xl mx-auto px-4 sm:px-6">
		<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
			{#each projects as project (project.link)}
				<a
					href={project.link}
					target="_blank"
					rel="noopener noreferrer"
					class="group transition-all duration-300 block h-full"
				>
					<div
						class="bg-white rounded-xl border border-slate-100 hover:border-green-200 hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full"
					>
						<div class="p-6 flex flex-col flex-grow">
							<div class="flex items-center mb-4">
								<div
									class="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-green-50 text-green-600 mr-3 group-hover:bg-green-100 transition-colors"
								>
									<svelte:component
										this={project.icon}
										class="w-5 h-5"
									/>
								</div>
								<h2
									class="text-lg font-semibold text-slate-800 group-hover:text-green-700 transition-colors font-display line-clamp-1"
								>
									{project.title}
								</h2>
							</div>

							<div
								class="mb-5 text-slate-600 text-sm space-y-2 flex-grow"
							>
								{#each project.description as desc}
									<p>{desc}</p>
								{/each}
							</div>

							<div
								class="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto"
							>
								<span class="text-xs text-slate-500">
									{project.date.substring(0, 4)}
								</span>
								<span
									class="text-green-600 flex items-center text-sm font-medium group-hover:text-green-700 transition-colors"
								>
									View Project
									<ArrowRight
										class="h-4 w-4 ml-1.5 transition-transform group-hover:translate-x-0.5"
									/>
								</span>
							</div>
						</div>
					</div>
				</a>
			{/each}
		</div>
	</div>
</section>

<!-- Skills Section -->
<section class="py-16 bg-slate-50 border-t border-slate-100">
	<div class="max-w-4xl mx-auto px-4 sm:px-6">
		<h2
			class="text-2xl md:text-3xl font-bold text-slate-900 mb-8 font-display text-center"
		>
			Technical Expertise
		</h2>

		<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
			<div
				class="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300"
			>
				<h3
					class="font-medium text-slate-800 mb-3 text-sm uppercase tracking-wide"
				>
					Languages
				</h3>
				<ul class="space-y-2">
					<li class="text-sm text-slate-600 flex items-center">
						<span
							class="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 flex-shrink-0"
						></span>
						Python
					</li>
					<li class="text-sm text-slate-600 flex items-center">
						<span
							class="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 flex-shrink-0"
						></span>
						JavaScript / TypeScript
					</li>
					<li class="text-sm text-slate-600 flex items-center">
						<span
							class="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 flex-shrink-0"
						></span>
						R
					</li>
					<li class="text-sm text-slate-600 flex items-center">
						<span
							class="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 flex-shrink-0"
						></span>
						SQL
					</li>
				</ul>
			</div>
			<div
				class="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300"
			>
				<h3
					class="font-medium text-slate-800 mb-3 text-sm uppercase tracking-wide"
				>
					Web Technologies
				</h3>
				<ul class="space-y-2">
					<li class="text-sm text-slate-600 flex items-center">
						<span
							class="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 flex-shrink-0"
						></span>
						SvelteKit
					</li>
					<li class="text-sm text-slate-600 flex items-center">
						<span
							class="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 flex-shrink-0"
						></span>
						Next.js / React
					</li>
					<li class="text-sm text-slate-600 flex items-center">
						<span
							class="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 flex-shrink-0"
						></span>
						Astro
					</li>
					<li class="text-sm text-slate-600 flex items-center">
						<span
							class="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 flex-shrink-0"
						></span>
						Tailwind CSS
					</li>
				</ul>
			</div>
			<div
				class="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300"
			>
				<h3
					class="font-medium text-slate-800 mb-3 text-sm uppercase tracking-wide"
				>
					GIS & Data Vis
				</h3>
				<ul class="space-y-2">
					<li class="text-sm text-slate-600 flex items-center">
						<span
							class="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 flex-shrink-0"
						></span>
						QGIS
					</li>
					<li class="text-sm text-slate-600 flex items-center">
						<span
							class="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 flex-shrink-0"
						></span>
						ArcGIS Pro
					</li>
					<li class="text-sm text-slate-600 flex items-center">
						<span
							class="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 flex-shrink-0"
						></span>
						PostGIS
					</li>
					<li class="text-sm text-slate-600 flex items-center">
						<span
							class="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 flex-shrink-0"
						></span>
						Mapbox GL JS / Leaflet
					</li>
				</ul>
			</div>
			<div
				class="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300"
			>
				<h3
					class="font-medium text-slate-800 mb-3 text-sm uppercase tracking-wide"
				>
					Infrastructure
				</h3>
				<ul class="space-y-2">
					<li class="text-sm text-slate-600 flex items-center">
						<span
							class="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 flex-shrink-0"
						></span>
						AWS
					</li>
					<li class="text-sm text-slate-600 flex items-center">
						<span
							class="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 flex-shrink-0"
						></span>
						Docker
					</li>
					<li class="text-sm text-slate-600 flex items-center">
						<span
							class="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 flex-shrink-0"
						></span>
						MySQL / PostgreSQL
					</li>
					<li class="text-sm text-slate-600 flex items-center">
						<span
							class="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 flex-shrink-0"
						></span>
						Redis
					</li>
				</ul>
			</div>
		</div>

		<div class="mt-10 text-center">
			<a
				href="/Jacob Weinbren - Resume.pdf"
				download
				class="btn btn-primary inline-flex items-center text-sm shadow-sm"
			>
				<Download class="h-4 w-4 mr-2" />
				Download Full CV
			</a>
		</div>
	</div>
</section>
