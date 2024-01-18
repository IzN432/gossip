import toast from "react-hot-toast";
import { PostMini } from "../types/posts.interface";

export function calculateLikeSort(a: PostMini, b: PostMini) {
	return calculateLikeness(b) - calculateLikeness(a);
}

function calculateLikeness(a: PostMini): number {
	return removeSelfLike(a) + 0.25 * removeSelfDislike(a);
}

function removeSelfLike(a: PostMini): number {
	return a.likeCount - (a.like.isLiked ? 1 : 0);
}

function removeSelfDislike(a: PostMini): number {
	return a.dislikeCount - (a.like.isDisliked ? 1 : 0);
}

export function errorHandle(error: any, origin: string) {
	toast.error(errorMessage(error, origin));
}

export function errorMessage(error: any, origin: string) {
	if (!error) return `${origin}: Something went wrong`;
	else if ("data" in error)
		return `${origin}: ${(error.data as { error: string }).error}`;
	else if ("error" in error) return `${origin}: ${error.error as string}`;
	else return `${origin}: Something went wrong`;
}

export function capitalizeFirstLetter(str: string) {
	return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
