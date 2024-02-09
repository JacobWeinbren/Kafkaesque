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
	return new Response(JSON.stringify({ message: "This is a post" }), {
		status: 200,
	});
};
