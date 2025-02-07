// src/pages/api/signup.ts
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
	const data = await request.formData();
	const email = data.get("email")?.toString();

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
				Authorization: `Bearer ${
					import.meta.env.HASHNODE_ACCESS_TOKEN
				}`,
			},
			body: JSON.stringify({
				query: mutation,
				variables: {
					input: {
						publicationId: import.meta.env.HASHNODE_PUBLICATION_ID,
						email,
					},
				},
			}),
		});

		const result = await response.json();

		if (result.errors) {
			console.error("Newsletter subscription error:", result.errors);
			return new Response(
				JSON.stringify({
					success: false,
					message: result.errors[0].message || "Failed to subscribe",
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
