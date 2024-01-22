export interface Message<T> {
	data: T;
	message: string;
}

export interface User {
	id: number;
	username: string;
	role: string;
}

export interface UserLogin {
	username: string;
	password: string;
}

export interface Login {
	user: User;
	token: string;
}

export interface UserForm {
	username: string;
	password: string;
	role: string;
}

export interface PostMini {
	id: number;
	title: string;
	content: string;
	tags: Tag[];
	owner: User;
	created_at: string;
	like: Like;
	likeCount: number;
	dislikeCount: number;
	replyCount: number;
}

export interface PostForm {
	title: string;
	content: string;
	tags: Tag[];
}

export interface PostUpdateForm {
	id: number;
	title: string;
	content: string;
	tags: Tag[];
}

export interface Post {
	id: number;
	title: string;
	content: string;
	tags: Tag[];
	owner: User;
	like: Like;
	created_at: string;
	likeCount: number;
	dislikeCount: number;
	replyCount: number;
}

export interface Tag {
	id: number;
	description: string;
	postCount: number;
}

export interface TagForm {
	description: string;
}

export interface Reply {
	id: number;
	content: string;
	post_id: number;
	owner: User;
	created_at: string;
}

export interface ReplyForm {
	content: string;
	post_id: number;
}

export interface ReplyUpdateForm {
	id: number;
	content: string;
	post_id: number;
}

export interface Like {
	interacted: boolean;
	isLiked: boolean;
	isDisliked: boolean;
}

export interface LikeForm {
	isLiked: boolean;
	isDisliked: boolean;
	post_id: number;
}
