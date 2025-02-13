/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ["class"],
	content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
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
			typography: (theme) => ({
				DEFAULT: {
					css: {
						color: theme("colors.gray.700"),
						a: {
							color: theme("colors.green.600"),
							"&:hover": {
								color: theme("colors.green.700"),
							},
						},
						"h1,h2,h3,h4": {
							color: theme("colors.gray.900"),
							fontWeight: "700",
						},
						code: {
							color: theme("colors.green.600"),
							backgroundColor: theme("colors.gray.100"),
							paddingLeft: "4px",
							paddingRight: "4px",
							paddingTop: "2px",
							paddingBottom: "2px",
							borderRadius: "0.25rem",
						},
						"code::before": {
							content: "none",
						},
						"code::after": {
							content: "none",
						},
					},
				},
			}),
			animation: {
				"fade-in": "fadeIn 0.5s ease-out",
				"slide-up": "slideUp 0.5s ease-out",
			},
			keyframes: {
				fadeIn: {
					"0%": { opacity: "0" },
					"100%": { opacity: "1" },
				},
				slideUp: {
					"0%": { transform: "translateY(20px)", opacity: "0" },
					"100%": { transform: "translateY(0)", opacity: "1" },
				},
			},
		},
	},
	plugins: [
		require("@tailwindcss/typography"),
		require("@tailwindcss/forms"),
		require("@tailwindcss/aspect-ratio"),
	],
};
