/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ["class"],
	content: ["./src/**/*.{astro,html,js,jsx,ts,tsx,vue,svelte,md,mdx}"],
	theme: {
		extend: {
			colors: {
				green: {
					50: "#f0fdf4",
					100: "#dcfce7",
					200: "#bbf7d0",
					300: "#86efac",
					400: "#4ade80",
					500: "#22c55e",
					600: "#16a34a",
					700: "#15803d",
					800: "#166534",
					900: "#14532d",
				},
			},
			fontFamily: {
				sans: ["Inter", "sans-serif"],
				display: ["Manrope", "sans-serif"],
			},
			animation: {
				"fade-in-fast":
					"fadeInFast 300ms cubic-bezier(0.16, 1, 0.3, 1)",
				"pop-up": "popUp 300ms cubic-bezier(0.16, 1, 0.3, 1)",
				shimmer: "shimmer 1.5s infinite linear",
			},
			keyframes: {
				fadeInFast: {
					"0%": { opacity: 0, transform: "scale(0.97)" },
					"100%": { opacity: 1, transform: "scale(1)" },
				},
				popUp: {
					"0%": { opacity: 0, transform: "translateY(10px)" },
					"100%": { opacity: 1, transform: "translateY(0)" },
				},
				shimmer: {
					"0%": { backgroundPosition: "-468px 0" },
					"100%": { backgroundPosition: "468px 0" },
				},
			},
			typography: (theme) => ({
				DEFAULT: {
					css: {
						a: {
							color: theme("colors.green.600"),
							"&:hover": {
								color: theme("colors.green.800"),
							},
						},
						h1: {
							fontFamily: theme("fontFamily.display").join(", "),
						},
						h2: {
							fontFamily: theme("fontFamily.display").join(", "),
						},
						h3: {
							fontFamily: theme("fontFamily.display").join(", "),
						},
						h4: {
							fontFamily: theme("fontFamily.display").join(", "),
						},
					},
				},
			}),
		},
	},
	plugins: [
		require("@tailwindcss/typography"),
		require("@tailwindcss/forms"),
		require("@tailwindcss/aspect-ratio"),
	],
};
