/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ["class"],
	content: ["./src/**/*.{html,js,svelte,ts}"],
	theme: {
		extend: {
			colors: {
				// Your green color palette...
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
				// Use Inter for standard text
				sans: [
					"Inter", // Primary font
					"ui-sans-serif",
					"system-ui",
					"-apple-system",
					"BlinkMacSystemFont",
					'"Segoe UI"',
					"Roboto",
					'"Helvetica Neue"',
					"Arial",
					'"Noto Sans"',
					"sans-serif",
					'"Apple Color Emoji"',
					'"Segoe UI Emoji"',
					'"Segoe UI Symbol"',
					'"Noto Color Emoji"',
				],
				// ALSO use Inter for display text (headings)
				display: [
					"Inter", // Primary font
					"ui-sans-serif",
					"system-ui",
					"-apple-system",
					"BlinkMacSystemFont",
					'"Segoe UI"',
					"Roboto",
					'"Helvetica Neue"',
					"Arial",
					'"Noto Sans"',
					"sans-serif",
					'"Apple Color Emoji"',
					'"Segoe UI Emoji"',
					'"Segoe UI Symbol"',
					'"Noto Color Emoji"',
				],
			},
			animation: {
				// Your animations...
				"fade-in-fast":
					"fadeInFast 300ms cubic-bezier(0.16, 1, 0.3, 1)",
				"pop-up": "popUp 300ms cubic-bezier(0.16, 1, 0.3, 1)",
				shimmer: "shimmer 1.5s infinite linear",
			},
			keyframes: {
				// Your keyframes...
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
			// Typography plugin settings
			typography: (theme) => ({
				DEFAULT: {
					css: {
						// Standard prose variables...
						"--tw-prose-body": theme("colors.gray[700]"),
						"--tw-prose-headings": theme("colors.gray[900]"),
						// ... other prose variables
						"--tw-prose-invert-td-borders":
							theme("colors.gray[700]"),

						// Customizations
						// Headings will now use Inter by default via fontFamily.display
						// Ensure heading weights are appropriate if needed
						"h1, h2, h3, h4, h5, h6": {
							// fontFamily is inherited from 'display' which is now Inter
							fontWeight: "700", // Keep headings bold
						},
						a: {
							fontWeight: "500",
							textDecoration: "none",
							transition: "color 0.2s ease-in-out",
							"&:hover": {
								color: theme("colors.green.700"),
								textDecoration: "underline",
							},
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
