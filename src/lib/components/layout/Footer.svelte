<script lang="ts">
	import MailIcon from "lucide-svelte/icons/mail";
	import GithubIcon from "lucide-svelte/icons/github";
	import LinkedinIcon from "lucide-svelte/icons/linkedin";
	import MapPinIcon from "lucide-svelte/icons/map-pin";
	import MapIcon from "lucide-svelte/icons/map";
	import ExternalLinkIcon from "lucide-svelte/icons/external-link";
	import PhoneIcon from "lucide-svelte/icons/phone";

	const currentYear = new Date().getFullYear();

	const socialLinks = [
		{
			name: "Email",
			href: "mailto:jacobweinbren@gmail.com",
			icon: MailIcon,
		},
		{
			name: "GitHub",
			href: "https://github.com/JacobWeinbren",
			icon: GithubIcon,
		},
		{
			name: "LinkedIn",
			href: "https://www.linkedin.com/in/jacob-weinbren",
			icon: LinkedinIcon,
		},
	];

	const quickLinks = [
		{ name: "About", href: "/about" },
		{ name: "Portfolio", href: "/portfolio" },
		{ name: "Blog", href: "/blog" },
		{ name: "Contact", href: "/contact" },
	];
</script>

<footer
	class="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800"
>
	<div class="max-w-6xl mx-auto section-padding py-12">
		<div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
			<!-- Brand Section -->
			<div class="md:col-span-1">
				<a
					href="/"
					class="flex items-center text-slate-900 dark:text-slate-100 font-display font-semibold text-lg mb-4"
				>
					<MapIcon
						class="h-5 w-5 mr-2 text-emerald-600 dark:text-emerald-400"
					/>
					Jacob Weinbren
				</a>

				<p
					class="text-slate-600 dark:text-slate-400 leading-relaxed mb-4"
				>
					GIS specialist and full-stack developer focused on spatial
					data visualisation, mapping technologies, and web
					development.
				</p>

				<div class="space-y-2 mb-4">
					<div
						class="flex items-center text-slate-500 dark:text-slate-400"
					>
						<MapPinIcon
							class="w-4 h-4 mr-2 text-emerald-600 dark:text-emerald-400"
						/>
						<span>Exeter, Devon, United Kingdom</span>
					</div>
					
				</div>

				<!-- Social Links -->
				<div class="flex items-center gap-3">
					{#each socialLinks as link}
						<a
							href={link.href}
							target={link.href.startsWith("mailto:")
								? "_self"
								: "_blank"}
							rel={link.href.startsWith("mailto:")
								? ""
								: "noopener noreferrer"}
							class="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
							aria-label={link.name}
						>
							<svelte:component
								this={link.icon}
								class="w-4 h-4"
							/>
						</a>
					{/each}
				</div>
			</div>

			<!-- Quick Links -->
			<div>
				<h3
					class="font-display font-semibold text-slate-900 dark:text-slate-100 mb-4"
				>
					Quick Links
				</h3>
				<nav class="space-y-2">
					{#each quickLinks as link}
						<a
							href={link.href}
							class="block text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200"
						>
							{link.name}
						</a>
					{/each}
				</nav>
			</div>

			<!-- Current Focus -->
			<div>
				<h3
					class="font-display font-semibold text-slate-900 dark:text-slate-100 mb-4"
				>
					Current Focus
				</h3>
				<div class="space-y-3">
					<div>
						<h4
							class="font-medium text-slate-900 dark:text-slate-100 mb-1"
						>
							MSc Geographic Information Science
						</h4>
						<p class="text-sm text-slate-600 dark:text-slate-400">
							University of Exeter, 2024-2025
						</p>
					</div>
					<div>
						<h4
							class="font-medium text-slate-900 dark:text-slate-100 mb-1"
						>
							Research Interests
						</h4>
						<p class="text-sm text-slate-600 dark:text-slate-400">
							Spatial data science, election analysis, web mapping
						</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Bottom Section -->
		<div
			class="border-t border-slate-200 dark:border-slate-700 pt-6 flex flex-col md:flex-row justify-between items-center gap-4"
		>
			<p class="text-sm text-slate-500 dark:text-slate-400">
				© {currentYear} Jacob Weinbren. All rights reserved.
			</p>

			<p
				class="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1"
			>
				Built with
				<a
					href="https://kit.svelte.dev"
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition-colors duration-200"
				>
					SvelteKit
					<ExternalLinkIcon class="w-3 h-3" />
				</a>
			</p>
		</div>
	</div>
</footer>
