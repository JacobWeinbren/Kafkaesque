<script lang="ts">
	// Import LayoutData if you need access to data.url here, otherwise remove
	// import type { LayoutData } from './$types';
	import {
		FileText,
		Briefcase,
		Rss,
		ArrowRight,
		Download,
		MapPin,
	} from "lucide-svelte";

	// export let data: LayoutData; // Only needed if you use data.url below
</script>

<svelte:head>
	<!-- Override layout defaults specifically for the homepage -->
	<title>Jacob Weinbren | GIS Specialist & Full-Stack Developer</title>
	<meta
		name="description"
		content="Specialising in geospatial data visualisation and full-stack web development."
	/>
	<meta
		property="og:title"
		content="Jacob Weinbren | GIS Specialist & Full-Stack Developer"
	/>
	<meta
		property="og:description"
		content="Specialising in geospatial data visualisation and full-stack web development."
	/>
	<!-- og:url, og:image, twitter:image, twitter:card are inherited from layout -->
	<!-- og:type="website" is also inherited and correct for the homepage -->
</svelte:head>

<!-- Hero Section -->
<section
	class="relative min-h-[85vh] flex items-center bg-gradient-to-br from-green-800 via-green-700 to-green-600 text-white overflow-hidden py-16"
>
	<!-- Background pattern -->
	<div
		class="absolute inset-0 opacity-10"
		style="background-image: url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.2\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"
	></div>

	<div class="relative z-10 container mx-auto px-4 sm:px-6">
		<div class="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
			<div>
				<div
					class="flex items-center mb-6 text-green-50/90 text-sm font-medium"
				>
					<MapPin class="h-4 w-4 mr-2" />
					<span>Exeter, United Kingdom</span>
				</div>
				<h1
					class="font-display text-4xl sm:text-5xl md:text-6xl font-bold mb-5 tracking-tight text-white"
				>
					Jacob Weinbren
				</h1>
				<p class="text-xl max-w-xl mb-8 text-green-50 leading-relaxed">
					Full-stack developer & GIS specialist crafting dynamic
					spatial data visualisations and robust web applications.
				</p>
				<div class="flex flex-wrap gap-4 mb-8">
					<a
						href="/portfolio"
						class="btn bg-white text-green-800 hover:bg-green-50 shadow hover:shadow-md transition-all duration-300"
					>
						View Portfolio
						<ArrowRight class="h-4 w-4 ml-1.5" />
					</a>
					<a
						href="/blog"
						class="btn bg-green-600/60 backdrop-blur-sm text-white hover:bg-green-600/80 border border-green-500/50"
					>
						Read Blog
					</a>
				</div>
			</div>

			<div class="hidden md:block">
				<!-- Technical/Map-inspired decorative graphic -->
				<div
					class="relative rounded-xl overflow-hidden border border-white/20 shadow-lg opacity-90"
				>
					<svg
						viewBox="0 0 500 380"
						xmlns="http://www.w3.org/2000/svg"
						class="w-full h-auto"
					>
						<!-- SVG content -->
						<defs>
							<pattern
								id="grid-homepage"
								width="40"
								height="40"
								patternUnits="userSpaceOnUse"
							>
								<path
									d="M 40 0 L 0 0 0 40"
									fill="none"
									stroke="rgba(255,255,255,0.1)"
									stroke-width="1"
								></path>
							</pattern>
							<linearGradient
								id="mapGradient-homepage"
								x1="0%"
								y1="0%"
								x2="100%"
								y2="100%"
							>
								<stop
									offset="0%"
									stop-color="rgba(20,83,45,0.7)"
								></stop>
								<stop
									offset="100%"
									stop-color="rgba(21,128,61,0.7)"
								></stop>
							</linearGradient>
						</defs>
						<rect
							width="500"
							height="380"
							fill="url(#mapGradient-homepage)"
						></rect>
						<rect
							width="500"
							height="380"
							fill="url(#grid-homepage)"
						></rect>
						<path
							d="M100,80 L240,120 L320,60 L420,180 L380,240 L280,220 L200,300 L80,240 Z"
							fill="rgba(255,255,255,0.1)"
							stroke="rgba(255,255,255,0.6)"
							stroke-width="2"
						></path>
						<circle cx="180" cy="150" r="5" fill="#fff"></circle>
						<circle cx="320" cy="200" r="5" fill="#fff"></circle>
						<circle cx="120" cy="220" r="5" fill="#fff"></circle>
						<path
							d="M180,150 L320,200 L120,220 Z"
							stroke="rgba(255,255,255,0.6)"
							stroke-width="2"
							fill="none"
							stroke-dasharray="4,4"
						></path>
						<rect
							x="380"
							y="60"
							width="80"
							height="20"
							fill="rgba(255,255,255,0.2)"
						></rect>
						<rect
							x="380"
							y="90"
							width="40"
							height="20"
							fill="rgba(255,255,255,0.2)"
						></rect>
						<rect
							x="380"
							y="120"
							width="60"
							height="20"
							fill="rgba(255,255,255,0.2)"
						></rect>
						<text
							x="40"
							y="40"
							fill="rgba(255,255,255,0.6)"
							font-family="monospace"
							font-size="12">&lt;visualisation&gt;</text
						>
						<text
							x="40"
							y="340"
							fill="rgba(255,255,255,0.6)"
							font-family="monospace"
							font-size="12">&lt;/visualisation&gt;</text
						>
					</svg>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Quick Links Section -->
<section class="py-16 bg-slate-50 border-y border-slate-100">
	<div class="max-w-5xl mx-auto px-4 sm:px-6">
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
			<!-- CV/Resume Card -->
			<a
				href="/Jacob Weinbren - Resume.pdf"
				download
				class="group bg-white rounded-xl border border-slate-100 p-6 hover:border-green-200 hover:shadow-md transition-all duration-300 flex flex-col"
			>
				<div
					class="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors"
				>
					<FileText class="h-6 w-6 text-green-600" />
				</div>
				<h3 class="text-lg font-display font-bold text-slate-800 mb-2">
					CV / Resume
				</h3>
				<p class="text-slate-600 text-sm mb-4 flex-grow">
					Download my professional experience, skills, and
					qualifications.
				</p>
				<span
					class="inline-flex items-center text-green-600 text-sm font-medium group-hover:text-green-700 transition-colors"
				>
					Download PDF
					<Download
						class="h-4 w-4 ml-1.5 group-hover:translate-y-0.5 transition-transform"
					/>
				</span>
			</a>

			<!-- Portfolio Card -->
			<a
				href="/portfolio"
				class="group bg-white rounded-xl border border-slate-100 p-6 hover:border-green-200 hover:shadow-md transition-all duration-300 flex flex-col"
			>
				<div
					class="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors"
				>
					<Briefcase class="h-6 w-6 text-green-600" />
				</div>
				<h3 class="text-lg font-display font-bold text-slate-800 mb-2">
					Portfolio
				</h3>
				<p class="text-slate-600 text-sm mb-4 flex-grow">
					Explore my projects in GIS, data visualisation, and web
					development.
				</p>
				<span
					class="inline-flex items-center text-green-600 text-sm font-medium group-hover:text-green-700 transition-colors"
				>
					View Projects
					<ArrowRight
						class="h-4 w-4 ml-1.5 group-hover:translate-x-0.5 transition-transform"
					/>
				</span>
			</a>

			<!-- Blog Card -->
			<a
				href="/blog"
				class="group bg-white rounded-xl border border-slate-100 p-6 hover:border-green-200 hover:shadow-md transition-all duration-300 flex flex-col"
			>
				<div
					class="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors"
				>
					<Rss class="h-6 w-6 text-green-600" />
				</div>
				<h3 class="text-lg font-display font-bold text-slate-800 mb-2">
					Blog
				</h3>
				<p class="text-slate-600 text-sm mb-4 flex-grow">
					Articles and insights on GIS, spatial analysis, and
					development.
				</p>
				<span
					class="inline-flex items-center text-green-600 text-sm font-medium group-hover:text-green-700 transition-colors"
				>
					Read Articles
					<ArrowRight
						class="h-4 w-4 ml-1.5 group-hover:translate-x-0.5 transition-transform"
					/>
				</span>
			</a>
		</div>
	</div>
</section>

<!-- Contact Section -->
<section class="py-16 bg-white">
	<div class="max-w-4xl mx-auto px-4 sm:px-6">
		<div
			class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-8 border border-green-200 shadow-sm"
		>
			<div class="text-center">
				<h2
					class="text-2xl md:text-3xl font-bold text-slate-900 mb-4 font-display"
				>
					Let's Work Together
				</h2>
				<p class="text-slate-700 mb-6 max-w-xl mx-auto">
					Looking for expertise in spatial data visualisation or
					full-stack development? I'm available for projects and
					consultations.
				</p>
				<div class="flex flex-col sm:flex-row justify-center gap-4">
					<a
						href="mailto:jacobweinbren@gmail.com"
						class="btn btn-primary"
					>
						Get in Touch
					</a>
					<a href="/portfolio" class="btn btn-outline">
						View My Work
					</a>
				</div>
			</div>
		</div>
	</div>
</section>
