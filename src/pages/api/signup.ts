import { TSGhostAdminAPI } from "@ts-ghost/admin-api";

const api = new TSGhostAdminAPI(
	"https://kafkaesque.digitalpress.blog",
	import.meta.env.PUBLIC_ADMIN_API_KEY || "",
	"v5.47.0"
);

export const POST = async ({ request }) => {
	const formData = await request.formData();
	const email = formData.get("email");
	console.log(email);
	if (
		!email ||
		!email.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/)
	) {
		return new Response(
			JSON.stringify({ message: "Invalid email address" }),
			{ status: 400 }
		);
	}

	try {
		const response = await api.members.add({ email }, { send_email: true });
		console.log(response);
		if (!response.success) {
			const errorResponse = response as {
				success: false;
				errors: { message: string; type: string; context?: string }[];
			};
			return new Response(
				JSON.stringify({ message: errorResponse.errors[0].message }),
				{ status: 400 }
			);
		}
		return new Response(
			JSON.stringify({ message: "Member created successfully" }),
			{ status: 200 }
		);
	} catch (error) {
		console.error(error);
		return new Response(
			JSON.stringify({ message: "Error creating member" }),
			{ status: 500 }
		);
	}
};
