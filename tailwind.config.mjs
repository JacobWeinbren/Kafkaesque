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
			},
			animation: {
				"fade-in-fast": "fadeInFast 200ms cubic-bezier(0.4, 0, 0.2, 1)",
				"pop-up": "popUp 200ms ease-out",
			},
			keyframes: {
				fadeInFast: {
					"0%": { opacity: 0, transform: "scale(0.95)" },
					"100%": { opacity: 1, transform: "scale(1)" },
				},
				popUp: {
					"0%": { opacity: 0, transform: "translateY(10px)" },
					"100%": { opacity: 1, transform: "translateY(0)" },
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
