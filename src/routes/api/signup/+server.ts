import { json, error } from "@sveltejs/kit";
// This import relies on SvelteKit's type generation finding the .env file
import {
	HASHNODE_ACCESS_TOKEN,
	HASHNODE_PUBLICATION_ID,
} from "$env/static/private"; // Correct import path

// Ensure this file is indeed treated as a server route (+server.ts)

export async function POST({ request }) {
	let email: string | null = null;

	try {
		// Check if variables were loaded (they should not be undefined here)
		if (!HASHNODE_ACCESS_TOKEN || !HASHNODE_PUBLICATION_ID) {
			console.error(
				"API /api/signup: Missing Hashnode environment variables AFTER import. Check .env file and server restart."
			);
			// Throwing error here is appropriate as it's a server config issue
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

		console.log(`API /api/signup: Attempting to subscribe email: ${email}`);

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
				// Use the imported variables
				Authorization: `Bearer ${HASHNODE_ACCESS_TOKEN}`,
			},
			body: JSON.stringify({
				query: mutation,
				variables: {
					input: {
						// Use the imported variable
						publicationId: HASHNODE_PUBLICATION_ID,
						email,
					},
				},
			}),
		});

		const result = await response.json();

		if (!response.ok || result.errors) {
			console.error(
				"API /api/signup: Hashnode API error:",
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
		console.log(
			`API /api/signup: Subscription status for ${email}: ${status}`
		);

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
		} else {
			return json(
				{
					success: false,
					message: `Subscription status: ${
						status || "Unknown"
					}. Please try again.`,
				},
				{ status: 400 }
			);
		}
	} catch (err: any) {
		// Catch potential errors from error() helper or other exceptions
		console.error(
			`API /api/signup: Unexpected error for email ${email}:`,
			err
		);
		// If it's a SvelteKit HttpError, re-throw it, otherwise throw a generic 500
		if (err.status) {
			throw err;
		} else {
			error(500, "An unexpected server error occurred.");
		}
	}
}
