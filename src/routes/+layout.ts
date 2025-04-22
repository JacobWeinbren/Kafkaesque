// src/routes/+layout.ts

// Make sure you are importing from './$types' which is relative to this file
import type { LayoutLoad } from "./$types";

// Explicitly type the function parameter using LayoutLoad
export const load: LayoutLoad = ({ url }) => {
	// The 'url' parameter is now correctly typed because LayoutLoad defines it
	console.log("+layout.ts load function running. URL:", url.pathname); // Add log
	return {
		url: url, // This defines the shape of LayoutData
	};
};
