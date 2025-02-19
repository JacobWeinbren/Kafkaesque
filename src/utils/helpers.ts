// src/utils/helpers.ts
export function formatDate(date: string): string {
	return new Date(date).toLocaleDateString("en-UK", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}

export function truncate(str: string, length: number): string {
	return str.length <= length ? str : str.slice(0, length) + "...";
}
