import toast from "react-hot-toast";
import { User } from "../types/posts.interface";

export function logout() {
	localStorage.removeItem("AuthToken");
	localStorage.removeItem("user");

	const storageEvent = new Event("storage");
	window.dispatchEvent(storageEvent);

	toast("Logged out");
}

export function getUser(): User {
	const user = localStorage.getItem("user");
	if (!user) {
		const storageEvent = new Event("storage");
		window.dispatchEvent(storageEvent);
		return { id: 0, username: "", role: "" };
	}
	return JSON.parse(user);
}

export function getToken(): string | null {
	return localStorage.getItem("AuthToken");
}
