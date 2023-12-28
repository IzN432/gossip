import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
	LikeForm,
	Login,
	Message,
	Post,
	PostForm,
	PostMini,
	PostUpdateForm,
	Reply,
	ReplyForm,
	ReplyUpdateForm,
	Tag,
	TagForm,
	UserLogin,
} from "../types/posts.interface";
import {
	Middleware,
	MiddlewareAPI,
	isRejectedWithValue,
} from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import { getToken, logout } from "../utils/auth";

export const api = createApi({
	reducerPath: "api",
	tagTypes: ["Post", "Tag", "Reply"],
	baseQuery: fetchBaseQuery({
		baseUrl:
			process.env.NODE_ENV === "development"
				? "http://localhost:8080/api"
				: "/api",
		prepareHeaders: (headers) => {
			const token = getToken();
			if (token) {
				headers.set("Authorization", `Bearer ${token}`);
			}
			headers.set("Content-Type", "application/json");
		},
	}),
	endpoints: (builder) => ({
		// POSTS
		getPostById: builder.query<Post, number>({
			query: (id) => ({ url: `posts/${id}`, method: `GET` }),
			providesTags: (result, error, arg) => [{ type: "Post", id: arg }],
		}),
		getPosts: builder.query<PostMini[], void>({
			query: () => ({ url: `posts`, method: `GET` }),
			providesTags: ["Post"],
		}),
		createPost: builder.mutation<Message<null>, PostForm>({
			query: (post) => ({
				url: `posts`,
				method: `POST`,
				body: post,
			}),
			invalidatesTags: ["Post"],
		}),
		editPost: builder.mutation<Message<null>, PostUpdateForm>({
			query: (post) => ({
				url: `posts/${post.id}`,
				method: `PATCH`,
				body: post,
			}),
			invalidatesTags: ["Post"],
		}),
		deletePost: builder.mutation<Message<null>, number>({
			query: (id) => ({
				url: `posts/${id}`,
				method: `DELETE`,
			}),
			invalidatesTags: ["Post"],
		}),

		// REPLIES
		getRepliesByPostID: builder.query<Reply[], number>({
			query: (id) => ({ url: `replies/${id}`, method: `GET` }),
			providesTags: (result, error, arg) => [{ type: "Reply", id: arg }],
		}),
		createReply: builder.mutation<Message<Reply>, ReplyForm>({
			query: (reply) => ({
				url: `replies`,
				method: `POST`,
				body: reply,
			}),
			invalidatesTags: (result, error, arg) => [
				{ type: "Reply", id: arg.post_id },
			],
		}),
		editReply: builder.mutation<Message<Reply>, ReplyUpdateForm>({
			query: (reply) => ({
				url: `replies/${reply.id}`,
				method: `PATCH`,
				body: reply,
			}),
			invalidatesTags: (result, error, arg) => [
				{ type: "Reply", id: arg.post_id },
			],
		}),
		deleteReply: builder.mutation<Message<Reply>, number>({
			query: (id) => ({
				url: `replies/${id}`,
				method: `DELETE`,
			}),
			invalidatesTags: (result, error, arg) =>
				result ? [{ type: "Reply", id: result.data.post_id }] : ["Reply"],
		}),

		// TAGS
		getTags: builder.query<Tag[], void>({
			query: () => ({
				url: `tags`,
				method: `GET`,
			}),
			providesTags: ["Tag"],
		}),
		createTag: builder.mutation<Message<Tag>, TagForm>({
			query: (tag) => ({
				url: `tags`,
				method: `POST`,
				body: tag,
			}),
			invalidatesTags: ["Tag"],
		}),

		// USERS
		login: builder.mutation<Message<Login>, UserLogin>({
			query: (user) => ({
				url: `users/signin`,
				method: `POST`,
				body: user,
			}),
		}),
		createUser: builder.mutation<Message<Login>, UserLogin>({
			query: (user) => ({
				url: `users/signup`,
				method: `POST`,
				body: user,
			}),
		}),

		// LIKES
		likeOrDislike: builder.mutation<Message<null>, LikeForm>({
			query: (like) => ({
				url: `likes/${like.post_id}`,
				method: `POST`,
				body: like,
			}),
			invalidatesTags: ["Post"],
		}),
		unlikeOrDislike: builder.mutation<Message<null>, number>({
			query: (id) => ({
				url: `likes/${id}`,
				method: `DELETE`,
			}),
			invalidatesTags: ["Post"],
		}),
	}),
});

export const {
	useGetPostByIdQuery,
	useGetPostsQuery,
	useCreatePostMutation,
	useEditPostMutation,
	useDeletePostMutation,

	useGetRepliesByPostIDQuery,
	useCreateReplyMutation,
	useEditReplyMutation,
	useDeleteReplyMutation,

	useGetTagsQuery,
	useCreateTagMutation,

	useLoginMutation,
	useCreateUserMutation,

	useLikeOrDislikeMutation,
	useUnlikeOrDislikeMutation,
} = api;

export const handleTokenExpiration: Middleware =
	(api: MiddlewareAPI) => (next) => (action) => {
		if (isRejectedWithValue(action) && action.payload instanceof Object) {
			if (
				"data" in action.payload &&
				(action.payload.data as { error: string }).error ===
					"You are not authorized"
			) {
				if (getToken()) {
					toast("Your session has expired");
					logout();
				}
			}
		}

		return next(action);
	};

export const { resetApiState } = api.util;
