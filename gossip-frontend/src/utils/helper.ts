import toast from "react-hot-toast";
import { PostMini } from "../types/posts.interface";

export function calculateLikeSort(a: PostMini, b: PostMini) {
	return calculateLikeness(b) - calculateLikeness(a);
}

function calculateLikeness(a: PostMini): number {
	return removeSelfLike(a) + 0.25 * removeSelfDislike(a);
}

function removeSelfLike(a: PostMini): number {
	return (
		a.likes - (a.like.interacted && a.like.like_or_dislike === true ? 1 : 0)
	);
}

function removeSelfDislike(a: PostMini): number {
	return (
		a.dislikes - (a.like.interacted && a.like.like_or_dislike === false ? 1 : 0)
	);
}

export function errorHandle(error: any, origin: string) {
	if (!error) toast.error(`${origin}: Something went wrong`);
	else if ("data" in error)
		toast.error(`${origin}: ${(error.data as { error: string }).error}`);
	else if ("error" in error) toast.error(`${origin}: ${error.error as string}`);
	else toast.error(`${origin}: Something went wrong`);
}

export function capitalizeFirstLetter(str: string) {
	return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
