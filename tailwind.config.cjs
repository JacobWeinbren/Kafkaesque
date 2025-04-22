/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ["class"],
	content: ["./src/**/*.{html,js,svelte,ts}"], // Adjusted for SvelteKit
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
				// Use Manrope for display as in original config
				sans: ["Inter", "sans-serif"],
				display: ["Manrope", "sans-serif"],
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
			// Adjusted typography for Tailwind v3+
			typography: (theme) => ({
				DEFAULT: {
					css: {
						"--tw-prose-body": theme("colors.gray[700]"),
						"--tw-prose-headings": theme("colors.gray[900]"),
						"--tw-prose-lead": theme("colors.gray[600]"),
						"--tw-prose-links": theme("colors.green[600]"),
						"--tw-prose-bold": theme("colors.gray[900]"),
						"--tw-prose-counters": theme("colors.gray[500]"),
						"--tw-prose-bullets": theme("colors.gray[300]"),
						"--tw-prose-hr": theme("colors.gray[200]"),
						"--tw-prose-quotes": theme("colors.gray[900]"),
						"--tw-prose-quote-borders": theme("colors.green[300]"),
						"--tw-prose-captions": theme("colors.gray[500]"),
						"--tw-prose-code": theme("colors.gray[900]"),
						"--tw-prose-pre-code": theme("colors.gray[200]"),
						"--tw-prose-pre-bg": theme("colors.gray[800]"),
						"--tw-prose-th-borders": theme("colors.gray[300]"),
						"--tw-prose-td-borders": theme("colors.gray[200]"),
						"--tw-prose-invert-body": theme("colors.gray[300]"),
						"--tw-prose-invert-headings": theme("colors.white"),
						"--tw-prose-invert-lead": theme("colors.gray[400]"),
						"--tw-prose-invert-links": theme("colors.green[400]"),
						"--tw-prose-invert-bold": theme("colors.white"),
						"--tw-prose-invert-counters": theme("colors.gray[400]"),
						"--tw-prose-invert-bullets": theme("colors.gray[600]"),
						"--tw-prose-invert-hr": theme("colors.gray[700]"),
						"--tw-prose-invert-quotes": theme("colors.gray[100]"),
						"--tw-prose-invert-quote-borders":
							theme("colors.green[700]"),
						"--tw-prose-invert-captions": theme("colors.gray[400]"),
						"--tw-prose-invert-code": theme("colors.white"),
						"--tw-prose-invert-pre-code": theme("colors.gray[300]"),
						"--tw-prose-invert-pre-bg": "rgb(0 0 0 / 50%)",
						"--tw-prose-invert-th-borders":
							theme("colors.gray[600]"),
						"--tw-prose-invert-td-borders":
							theme("colors.gray[700]"),
						// Customizations
						a: {
							fontWeight: "500",
							textDecoration: "none",
							transition: "color 0.2s ease-in-out",
							"&:hover": {
								color: theme("colors.green.800"),
								textDecoration: "underline",
							},
						},
						"h1, h2, h3, h4": {
							fontFamily: theme("fontFamily.display").join(", "),
							fontWeight: "700",
						},
						// Add other prose styles if needed
					},
				},
				// Add custom prose sizes if needed (e.g., prose-custom)
				custom: {
					css: {
						// Example: Larger base font size
						// fontSize: theme('fontSize.lg'),
						// lineHeight: theme('lineHeight.relaxed'),
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
