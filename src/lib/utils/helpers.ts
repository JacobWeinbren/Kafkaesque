export function formatDate(dateString: string): string {
	try {
		return new Date(dateString).toLocaleDateString("en-GB", {
			day: "numeric",
			month: "long",
			year: "numeric",
		});
	} catch (e) {
		console.error("Error formatting date:", dateString, e);
		return "Invalid Date";
	}
}
