import { json, error } from "@sveltejs/kit";
import {
	HASHNODE_ACCESS_TOKEN,
	HASHNODE_PUBLICATION_ID,
} from "$env/static/private";

export async function POST({ request }) {
	let email: string | null = null;

	try {
		if (!HASHNODE_ACCESS_TOKEN || !HASHNODE_PUBLICATION_ID) {
			console.error(
				"Missing Hashnode environment variables. Check .env file and server restart."
			);
			error(500, "Server configuration error.");
		}

		const formData = await request.formData();
		email = formData.get("email")?.toString() ?? null;

		if (!email || !/\S+@\S+\.\S+/.test(email)) {
			return json(
				{ success: false, message: "Valid email is required" },
				{ status: 400 }
			);
		}

		console.log(`Attempting to subscribe email: ${email}`);

		const mutation = `
			mutation SubscribeToNewsletter($input: SubscribeToNewsletterInput!) {
				subscribeToNewsletter(input: $input) {
					status
				}
			}
		`;

		const response = await fetch("https://gql.hashnode.com", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${HASHNODE_ACCESS_TOKEN}`,
			},
			body: JSON.stringify({
				query: mutation,
				variables: {
					input: {
						publicationId: HASHNODE_PUBLICATION_ID,
						email,
					},
				},
			}),
		});

		const result = await response.json();

		if (!response.ok || result.errors) {
			console.error(
				"Hashnode API error:",
				JSON.stringify(
					result.errors || { status: response.status },
					null,
					2
				)
			);
			const errorMessage =
				result.errors?.[0]?.message ||
				"Failed to subscribe due to an API error.";
			if (errorMessage.toLowerCase().includes("already subscribed")) {
				return json(
					{ success: true, message: "You are already subscribed!" },
					{ status: 200 }
				);
			}
			return json(
				{ success: false, message: errorMessage },
				{ status: response.status === 401 ? 401 : 400 }
			);
		}

		const status = result.data?.subscribeToNewsletter?.status;
		console.log(`Subscription status for ${email}: ${status}`);

		if (
			status === "SUCCESS" ||
			status === "PENDING" ||
			status === "ALREADY_SUBSCRIBED"
		) {
			return json(
				{
					success: true,
					message: "Successfully subscribed! Check your email.",
				},
				{ status: 200 }
			);
		}

		return json(
			{
				success: false,
				message: `Subscription status: ${
					status || "Unknown"
				}. Please try again.`,
			},
			{ status: 400 }
		);
	} catch (err: unknown) {
		console.error(`Unexpected error for email ${email}:`, err);
		if (err && typeof err === "object" && "status" in err) {
			throw err;
		}
		error(500, "An unexpected server error occurred.");
	}
}
