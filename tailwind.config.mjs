const plugin = require("tailwindcss/plugin");

/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ["class"],
	content: [
		"./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}",
		"./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
	],
	prefix: "",
	theme: {
		screens: {
			xxs: "320px",
			xs: "480px",
			sm: "640px",
			md: "768px",
			lg: "1024px",
			xl: "1280px",
			"2xl": "1536px",
		},
		extend: {
			fontFamily: {
				kafka: ["Kafka", "sans-serif"],
				sans: ["Nunito", "serif", "system-ui"],
			},
		},
	},
};
