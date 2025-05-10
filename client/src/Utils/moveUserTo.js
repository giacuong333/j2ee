import paths from "../Constants/paths";

const ADMIN = "admin";
const CUSTOMER = "customer";
const OWNER = "owner";

export const moveUserTo = (role) => {
	const userRole = typeof role === "object" && role !== null ? role?.name : role;
	console.log("User role:", userRole);
	switch (userRole.toLowerCase().trim()) {
		case ADMIN.toLowerCase().trim():
			return paths.dashboard;
		case CUSTOMER.toLowerCase().trim():
			return paths.home;
		case OWNER.toLowerCase().trim():
			return paths.ownerhome;
		default:
			return paths.home;
	}
};
