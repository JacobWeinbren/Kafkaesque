// src/utils/helpers.ts
export function formatDate(date: string): string {
	return new Date(date).toLocaleDateString("en-UK", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}

export function truncate(str: string, length: number): string {
	if (str.length <= length) return str;
	return str.slice(0, length) + "...";
}
