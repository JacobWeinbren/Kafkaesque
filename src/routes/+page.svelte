<script lang="ts">
	import { onMount } from "svelte";
	import { fade, fly } from "svelte/transition";
	import MapPinIcon from "lucide-svelte/icons/map-pin";
	import MailIcon from "lucide-svelte/icons/mail";
	import GithubIcon from "lucide-svelte/icons/github";
	import LinkedinIcon from "lucide-svelte/icons/linkedin";
	import ExternalLinkIcon from "lucide-svelte/icons/external-link";
	import ArrowRightIcon from "lucide-svelte/icons/arrow-right";
	import AwardIcon from "lucide-svelte/icons/award";
	import CodeIcon from "lucide-svelte/icons/code";
	import DatabaseIcon from "lucide-svelte/icons/database";
	import MapIcon from "lucide-svelte/icons/map";
	import CheckCircleIcon from "lucide-svelte/icons/check-circle";
	import PhoneIcon from "lucide-svelte/icons/phone";
	import FileTextIcon from "lucide-svelte/icons/file-text";
	import Newsletter from "$lib/components/blog/Newsletter.svelte";
	import type { PageData } from "./$types";

	export let data: PageData;

	let mounted = false;

	onMount(() => {
		mounted = true;
	});

	const skills = [
		{
			category: "GIS & Mapping",
			icon: MapIcon,
			items: [
				"QGIS",
				"PostGIS",
				"Leaflet",
				"Mapbox",
				"GDAL",
				"Spatial Analysis",
			],
		},
		{
			category: "Full-Stack Development",
			icon: CodeIcon,
			items: [
				"JavaScript/TypeScript",
				"SvelteKit",
				"React",
				"Node.js",
				"Python",
				"PHP",
			],
		},
		{
			category: "Data Engineering",
			icon: DatabaseIcon,
			items: [
				"PostgreSQL",
				"Redis",
				"MongoDB",
				"Data Visualisation",
				"ETL Pipelines",
				"APIs",
			],
		},
	];

	const recognitions = [
		{
			text: "Jacob's ecological analysis has provided fascinating insights",
			source: "Stephen Bush, Political Editor, Financial Times",
			context: "UK General Election Analysis",
		},
		{
			text: "Excellent work on census data visualisation",
			source: "CEO, MountainMath",
			context: "Canadian Census 2021 Project",
		},
		{
			text: "Outstanding contribution to electoral research",
			source: "Professor Matthew Shugart",
			context: "Academic Research Collaboration",
		},
	];
</script>

<svelte:head>
	<title>Jacob Weinbren | GIS Specialist & Full-Stack Developer</title>
	<meta
		name="description"
		content="MSc Geographic Information Science student at University of Exeter. Experienced in spatial data analysis, web mapping, and full-stack development."
	/>
	{#if data.url}
		<link rel="canonical" href={data.url.href} />
		<meta property="og:url" content={data.url.href} />
	{/if}
</svelte:head>

<!-- Hero Section -->
<section class="relative overflow-hidden section">
	<div
		class="absolute inset-0 bg-gradient-to-br from-emerald-800 via-emerald-700 to-emerald-600"
	></div>
	<div
		class="absolute inset-0 opacity-10"
		style="background-image: url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.2\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"
	></div>

	<div class="relative max-w-6xl mx-auto section-padding">
		<div class="max-w-4xl">
			{#if mounted}
				<div in:fade={{ duration: 600, delay: 200 }}>
					<div class="flex items-center gap-3 mb-6">
						<div
							class="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"
						></div>
						<span class="text-emerald-100 font-medium"
							>Available for opportunities</span
						>
					</div>

					<h1
						class="text-4xl md:text-6xl font-bold text-white mb-6 font-display"
					>
						Jacob Weinbren
					</h1>

					<h2 class="text-xl md:text-2xl text-emerald-100 mb-6">
						GIS Specialist & Full-Stack Developer
					</h2>

					<p
						class="text-lg md:text-xl text-white/90 leading-relaxed mb-8 max-w-3xl"
					>
						MSc Geographic Information Science student at University
						of Exeter, creating innovative mapping solutions and
						spatial data visualisations. Experienced in full-stack
						development with recognition from industry leaders.
					</p>
				</div>

				<div
					in:fly={{ y: 20, duration: 600, delay: 400 }}
					class="flex flex-wrap gap-4 mb-8"
				>
					<a
						href="/portfolio"
						class="btn btn-primary bg-white text-emerald-600 hover:bg-emerald-50"
					>
						View Portfolio
						<ArrowRightIcon class="w-4 h-4" />
					</a>
					<a
						href="/Jacob Weinbren - Resume.pdf"
						target="_blank"
						rel="noopener noreferrer"
						class="btn btn-outline border-white/30 text-white hover:bg-white/10"
					>
						<FileTextIcon class="w-4 h-4" />
						Resume
					</a>
				</div>

				<div
					in:fly={{ y: 20, duration: 600, delay: 600 }}
					class="flex items-center gap-6 text-white/80"
				>
					<div class="flex items-center gap-2">
						<MapPinIcon class="w-4 h-4 text-emerald-300" />
						<span>Exeter, Devon, UK</span>
					</div>
				</div>
			{/if}
		</div>
	</div>
</section>

<!-- Skills Section -->
<section class="section bg-slate-50 dark:bg-slate-900">
	<div class="max-w-6xl mx-auto section-padding">
		<div class="text-center mb-12">
			<h2
				class="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4 font-display"
			>
				Technical Expertise
			</h2>
			<p
				class="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"
			>
				Combining GIS knowledge with modern development practices to
				create powerful spatial solutions
			</p>
		</div>

		<div class="grid md:grid-cols-3 gap-8">
			{#each skills as skill, i}
				{#if mounted}
					<div
						in:fade={{ duration: 400, delay: 200 + i * 100 }}
						class="card text-center"
					>
						<div
							class="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mx-auto mb-4"
						>
							<svelte:component
								this={skill.icon}
								class="w-6 h-6 text-emerald-600 dark:text-emerald-400"
							/>
						</div>
						<h3
							class="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4"
						>
							{skill.category}
						</h3>
						<div class="flex flex-wrap gap-2 justify-center">
							{#each skill.items as item}
								<span class="badge badge-secondary">{item}</span
								>
							{/each}
						</div>
					</div>
				{/if}
			{/each}
		</div>
	</div>
</section>

<!-- Newsletter Section -->
<section class="section">
	<div class="max-w-4xl mx-auto section-padding">
		<Newsletter />
	</div>
</section>
