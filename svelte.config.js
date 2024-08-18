module.exports = async () => {
	const { vitePreprocess } = await import("@astrojs/svelte");

	return {
		preprocess: vitePreprocess(),
	};
};
