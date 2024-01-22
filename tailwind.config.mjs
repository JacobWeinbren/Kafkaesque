/** @type {import('tailwindcss').Config} */
export default {
	content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
	theme: {
		extend: {
			fontFamily: {
				sans: ["Inter", "sans-serif"],
			},
			fontWeight: {
				normal: 400,
				medium: 500,
				semibold: 600,
				bold: 700,
				light: 300,
			},
		},
	},
	plugins: [],
};
