// src/pages/api/signup.ts
import type { APIRoute } from "astro";
import { TSGhostAdminAPI } from "@ts-ghost/admin-api";

const api = new TSGhostAdminAPI(
	"https://kafkaesque.digitalpress.blog",
	import.meta.env.GHOST_ADMIN_API_KEY || "",
	"v5.47.0"
);

interface ErrorResponse {
	success: false;
	errors: Array<{ message: string; type: string; context?: string }>;
}

export const POST: APIRoute = async ({ request }) => {
	const data = await request.formData();
	const email = data.get("email")?.toString();
	const name = data.get("name")?.toString() || "";

	if (!email) {
		return new Response(
			JSON.stringify({
				success: false,
				message: "Email is required",
			}),
			{ status: 400 }
		);
	}

	try {
		const response = await api.members.add({
			email,
			name,
			subscribed: true,
		});

		const result = await response;

		// Type guard to check if it's an error response
		if (!result.success) {
			const errorResponse = result as ErrorResponse;
			return new Response(
				JSON.stringify({
					success: false,
					message:
						errorResponse.errors[0]?.message ||
						"Failed to subscribe",
				}),
				{ status: 400 }
			);
		}

		return new Response(
			JSON.stringify({
				success: true,
				message: "Successfully subscribed!",
			}),
			{ status: 200 }
		);
	} catch (error) {
		console.error("Subscription error:", error);
		return new Response(
			JSON.stringify({
				success: false,
				message: "An error occurred",
			}),
			{ status: 500 }
		);
	}
};
