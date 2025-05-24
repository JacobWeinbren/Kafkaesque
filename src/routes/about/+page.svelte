<script lang="ts">
	import { onMount } from "svelte";
	import { fade, fly } from "svelte/transition";
	import {
		MapPin,
		Calendar,
		Award,
		BookOpen,
		Code,
		Database,
		Map as MapIcon,
		Users,
		Target,
		Lightbulb,
		Mail,
		Phone,
		GraduationCap,
		Briefcase,
	} from "lucide-svelte";
	import type { PageData } from "./$types";

	export let data: PageData;

	let mounted = false;

	onMount(() => {
		mounted = true;
	});

	const timeline = [
		{
			year: "2024-2025",
			title: "MSc Geographic Information Science",
			org: "University of Exeter",
			description:
				"Modules include Drone Analysis and Geo-Visualisations, Spatial Data Science, Environmental Remote Sensing, and Open Source GIS. Currently pursuing internship with Digital Estates Team.",
			current: true,
		},
		{
			year: "2023-2024",
			title: "Website Developer",
			org: "Novi Digital (Remote)",
			description:
				"Directed B2B service management projects using Next.js and Laravel. Implemented Google Analytics for 30+ businesses and translated complex Figma designs.",
			current: false,
		},
		{
			year: "2022-2023",
			title: "Website Developer",
			org: "Binary Spiders",
			description:
				"Enhanced website portfolios through UX and accessibility improvements. Built robust login systems and strengthened site security.",
			current: false,
		},
		{
			year: "2021-2024",
			title: "Major GIS & Data Projects",
			org: "Independent Research",
			description:
				"Canadian Census 2021 visualisation (2,500 variables), UK General Election analysis, Hebrew transliteration system with neural networks.",
			current: false,
		},
		{
			year: "2019-2022",
			title: "English BA",
			org: "University of Exeter",
			description:
				"Graduated with 2:1. Developed analytical and research skills that complement technical expertise in spatial data analysis.",
			current: false,
		},
	];

	const expertise = [
		{
			category: "Spatial Analysis",
			icon: MapIcon,
			skills: [
				"Electoral Geography",
				"Census Data Analysis",
				"GIS Visualisation",
				"Drone Analysis",
			],
		},
		{
			category: "Development",
			icon: Code,
			skills: [
				"Next.js & React",
				"Svelte & Astro",
				"Python & Laravel",
				"CI/CD & Docker",
			],
		},
		{
			category: "Data Science",
			icon: Database,
			skills: [
				"Neural Networks",
				"Redis Map Servers",
				"MySQL & AWS",
				"Google Analytics",
			],
		},
	];

	const values = [
		{
			icon: Target,
			title: "Precision",
			description:
				"Delivering accurate spatial analysis with rigorous methodology, evidenced by academic and industry recognition.",
		},
		{
			icon: Lightbulb,
			title: "Innovation",
			description:
				"Combining traditional GIS with modern web technologies, from neural network transliteration to interactive census visualisations.",
		},
		{
			icon: Users,
			title: "Leadership",
			description:
				"Coordinating global teams and serving as Treasurer of Exeter Postgraduate Society, managing complex projects and finances.",
		},
	];
</script>

<svelte:head>
	<title>About – Jacob Weinbren</title>
	<meta
		name="description"
		content="Learn about Jacob Weinbren's background in GIS, spatial data science, and full-stack development. Currently pursuing MSc Geographic Information Science at University of Exeter."
	/>
	{#if data.url}
		<link rel="canonical" href={data.url.href} />
		<meta property="og:url" content={data.url.href} />
	{/if}
	<meta property="og:title" content="About – Jacob Weinbren" />
	<meta
		property="og:description"
		content="Learn about Jacob Weinbren's background in GIS, spatial data science, and full-stack development."
	/>
	<meta property="og:type" content="website" />
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
		{#if mounted}
			<div in:fade={{ duration: 600, delay: 200 }} class="max-w-4xl">
				<h1
					class="text-4xl md:text-5xl font-bold text-white mb-6 font-display"
				>
					About Me
				</h1>
				<p
					class="text-lg md:text-xl text-white/90 leading-relaxed max-w-3xl"
				>
					I'm passionate about the intersection of geography, technology, and
					data science. Currently pursuing advanced studies while building
					innovative solutions that combine spatial analysis with modern web
					development.
				</p>
			</div>
		{/if}
	</div>
</section>

<!-- Main Content -->
<section class="section">
	<div class="max-w-6xl mx-auto section-padding">
		<div class="grid lg:grid-cols-3 gap-12">
			<!-- Main Content -->
			<div class="lg:col-span-2 space-y-8">
				{#if mounted}
					<div in:fade={{ duration: 400, delay: 300 }}>
						<h2
							class="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4 font-display"
						>
							Background
						</h2>
						<div class="prose-custom">
							<p
								class="text-slate-600 dark:text-slate-400 leading-relaxed mb-4"
							>
								I'm currently pursuing an MSc in Geographic Information Science at the
								University of Exeter, building on my experience as a full-stack web
								developer and AWS Certified Cloud Practitioner. My work bridges
								traditional GIS analysis with cutting-edge web technologies and data
								science.
							</p>
							<p
								class="text-slate-600 dark:text-slate-400 leading-relaxed mb-4"
							>
								My projects have gained recognition from prominent figures including
								Financial Times Political Editor Stephen Bush for electoral analysis,
								MountainMath CEO Dr. Bergmann for census visualisation work, and
								Professor Matthew Shugart for Israeli election mapping. I've successfully
								coordinated global teams and delivered complex technical solutions.
							</p>
							<p
								class="text-slate-600 dark:text-slate-400 leading-relaxed"
							>
								As Treasurer of the Exeter Postgraduate Society, I manage financial
								responsibilities while pursuing research in spatial data science,
								environmental remote sensing, and open source GIS. I'm particularly
								passionate about making complex spatial data accessible through
								innovative web-based visualisations.
							</p>
						</div>
					</div>

					<div in:fade={{ duration: 400, delay: 400 }}>
						<h2
							class="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6 font-display"
						>
							Timeline
						</h2>
						<div class="space-y-6">
							{#each timeline as item, i}
								<div class="flex gap-4">
									<div class="flex flex-col items-center">
										<div
											class="w-3 h-3 {item.current
												? 'bg-emerald-500'
												: 'bg-slate-300 dark:bg-slate-600'} rounded-full"
										></div>
										{#if i < timeline.length - 1}
											<div
												class="w-px h-16 bg-slate-200 dark:bg-slate-700 mt-2"
											></div>
										{/if}
									</div>
									<div class="flex-1 pb-8">
										<div class="flex items-center gap-3 mb-2">
											<span
												class="text-sm font-medium text-emerald-600 dark:text-emerald-400"
											>
												{item.year}
											</span>
											{#if item.current}
												<span class="badge badge-primary">Current</span>
											{/if}
										</div>
										<h3
											class="font-semibold text-slate-900 dark:text-slate-100 mb-1"
										>
											{item.title}
										</h3>
										<p
											class="text-sm text-slate-500 dark:text-slate-400 mb-2"
										>
											{item.org}
										</p>
										<p
											class="text-slate-600 dark:text-slate-400 text-sm"
										>
											{item.description}
										</p>
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>

			<!-- Sidebar -->
			<div class="lg:col-span-1 space-y-6">
				{#if mounted}
					<div in:fade={{ duration: 400, delay: 500 }} class="card">
						<h3
							class="font-semibold text-slate-900 dark:text-slate-100 mb-4"
						>
							Quick Facts
						</h3>
						<div class="space-y-3">
							<div class="flex items-center gap-3">
								<MapPin
									class="w-4 h-4 text-emerald-600 dark:text-emerald-400"
								/>
								<span class="text-slate-600 dark:text-slate-400 text-sm">
									Exeter, Devon, UK
								</span>
							</div>
							<div class="flex items-center gap-3">
								<GraduationCap
									class="w-4 h-4 text-emerald-600 dark:text-emerald-400"
								/>
								<span class="text-slate-600 dark:text-slate-400 text-sm">
									MSc GIS Student
								</span>
							</div>
							<div class="flex items-center gap-3">
								<Award
									class="w-4 h-4 text-emerald-600 dark:text-emerald-400"
								/>
								<span class="text-slate-600 dark:text-slate-400 text-sm">
									AWS Certified
								</span>
							</div>
							<div class="flex items-center gap-3">
								<Briefcase
									class="w-4 h-4 text-emerald-600 dark:text-emerald-400"
								/>
								<span class="text-slate-600 dark:text-slate-400 text-sm">
									PGS Treasurer
								</span>
							</div>
							<div class="flex items-center gap-3">
								<Calendar
									class="w-4 h-4 text-emerald-600 dark:text-emerald-400"
								/>
								<span class="text-slate-600 dark:text-slate-400 text-sm">
									Available 2025
								</span>
							</div>
						</div>
					</div>

					<div in:fade={{ duration: 400, delay: 600 }} class="card">
						<h3
							class="font-semibold text-slate-900 dark:text-slate-100 mb-4"
						>
							Contact
						</h3>
						<div class="space-y-3">
							<a
								href="mailto:jacobweinbren@gmail.com"
								class="flex items-center gap-3 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
							>
								<Mail class="w-4 h-4" />
								<span class="text-sm">jacobweinbren@gmail.com</span>
							</a>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
</section>

<!-- Expertise Section -->
<section class="section bg-slate-50 dark:bg-slate-900">
	<div class="max-w-6xl mx-auto section-padding">
		<div class="text-center mb-12">
			<h2
				class="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4 font-display"
			>
				Areas of Expertise
			</h2>
			<p
				class="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"
			>
				Specialising in the application of GIS and spatial analysis to
				real-world challenges
			</p>
		</div>

		<div class="grid md:grid-cols-3 gap-8 mb-12">
			{#each expertise as area, i}
				{#if mounted}
					<div
						in:fade={{ duration: 400, delay: 300 + i * 100 }}
						class="card text-center"
					>
						<div
							class="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mx-auto mb-4"
						>
							<svelte:component
								this={area.icon}
								class="w-6 h-6 text-emerald-600 dark:text-emerald-400"
							/>
						</div>
						<h3
							class="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4"
						>
							{area.category}
						</h3>
						<div class="space-y-2">
							{#each area.skills as skill}
								<div
									class="text-slate-600 dark:text-slate-400 text-sm"
								>
									{skill}
								</div>
							{/each}
						</div>
					</div>
				{/if}
			{/each}
		</div>

		
	</div>
</section>