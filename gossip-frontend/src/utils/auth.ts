import toast from "react-hot-toast";

export function logout() {
	localStorage.removeItem("AuthToken");
	localStorage.removeItem("user");

	const storageEvent = new Event("storage");
	window.dispatchEvent(storageEvent);

	toast("Logged out");
}

export function getToken(): string | null {
	return localStorage.getItem("AuthToken");
}

export function setToken(token: string) {
	localStorage.setItem("AuthToken", token);

	const storageEvent = new Event("storage");
	window.dispatchEvent(storageEvent);
}
