<script lang="ts">
	import { Mail, Github, Linkedin, MapPin } from "lucide-svelte";
	const currentYear = new Date().getFullYear();
</script>

<footer class="bg-white py-12 border-t border-slate-100">
	<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
			<div class="md:col-span-5">
				<a
					href="/"
					class="flex items-center text-green-700 font-display font-bold text-xl mb-3"
				>
					<svg
						viewBox="0 0 24 24"
						class="h-6 w-6 mr-2"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M3 19V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19Z"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
						<path
							d="M9 10C10.1046 10 11 9.10457 11 8C11 6.89543 10.1046 6 9 6C7.89543 6 7 6.89543 7 8C7 9.10457 7.89543 10 9 10Z"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
						<path
							d="M15 8L17 10"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
						/>
						<path
							d="M7 18V16L10 13L12 15L17 10"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
					Jacob Weinbren
				</a>
				<p class="text-slate-600 text-sm mb-4 max-w-md">
					GIS specialist and full-stack developer focused on spatial
					data visualization, mapping, and web development.
				</p>

				<div class="flex items-center text-sm text-slate-500 mb-4">
					<MapPin class="w-4 h-4 mr-2 text-green-600" />
					<span>Exeter, United Kingdom</span>
				</div>
			</div>

			<div class="md:col-span-4">
				<h3
					class="text-sm font-semibold uppercase tracking-wider text-slate-800 mb-4"
				>
					Connect
				</h3>
				<div class="space-y-3">
					<a
						href="mailto:jacobweinbren@gmail.com"
						class="flex items-center text-slate-600 hover:text-green-700 transition text-sm"
					>
						<Mail class="w-4 h-4 mr-2" />
						jacobweinbren@gmail.com
					</a>
					<a
						href="https://github.com/JacobWeinbren"
						target="_blank"
						rel="noopener noreferrer"
						class="flex items-center text-slate-600 hover:text-green-700 transition text-sm"
					>
						<Github class="w-4 h-4 mr-2" />
						GitHub
					</a>
					<a
						href="https://www.linkedin.com/in/jacob-weinbren"
						target="_blank"
						rel="noopener noreferrer"
						class="flex items-center text-slate-600 hover:text-green-700 transition text-sm"
					>
						<Linkedin class="w-4 h-4 mr-2" />
						LinkedIn
					</a>
				</div>
			</div>
		</div>

		<div
			class="border-t border-slate-100 pt-6 flex flex-col md:flex-row justify-between items-center"
		>
			<p class="text-slate-500 text-xs">
				© {currentYear} Jacob Weinbren. All rights reserved.
			</p>
			<p class="text-slate-500 text-xs mt-2 md:mt-0">
				Built with <a
					href="https://kit.svelte.dev"
					target="_blank"
					rel="noopener noreferrer"
					class="text-green-600 hover:text-green-700 font-medium"
					>SvelteKit</a
				>
			</p>
		</div>
	</div>
</footer>
