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
	likes: number;
	dislikes: number;
}

export interface PostForm {
	title: string;
	content: string;
	tags: Tag[];
	owner: User;
}

export interface PostUpdateForm {
	id: number;
	title: string;
	content: string;
	tags: Tag[];
	owner: User;
}

export interface Post {
	id: number;
	title: string;
	content: string;
	tags: Tag[];
	owner: User;
	like: Like;
	created_at: string;
	likes: number;
	dislikes: number;
}

export interface Tag {
	id: number;
	description: string;
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
	like: boolean;
	dislike: boolean;
}

export interface LikeForm {
	like: boolean;
	dislike: boolean;
	post_id: number;
}
