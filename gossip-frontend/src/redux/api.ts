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
	User,
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
			invalidatesTags: ["Post", "Tag"],
		}),
		editPost: builder.mutation<Message<null>, PostUpdateForm>({
			query: (post) => ({
				url: `posts/${post.id}`,
				method: `PATCH`,
				body: post,
			}),
			invalidatesTags: ["Post", "Tag"],
		}),
		deletePost: builder.mutation<Message<null>, number>({
			query: (id) => ({
				url: `posts/${id}`,
				method: `DELETE`,
			}),
			invalidatesTags: ["Post", "Tag"],
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
		getUser: builder.query<User, void>({
			query: () => ({
				url: `users`,
				method: `GET`,
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
			async onQueryStarted(
				{ isLiked, isDisliked, post_id },
				{ dispatch, queryFulfilled }
			) {
				const patchPostsResult = dispatch(
					api.util.updateQueryData("getPosts", undefined, (draftPosts) => {
						const postToUpdate = draftPosts.find((post) => post.id === post_id);

						if (postToUpdate) {
							if (postToUpdate.like.isLiked !== isLiked) {
								postToUpdate.likeCount += isLiked ? 1 : -1;
							} else if (!postToUpdate.like.isDisliked !== isDisliked) {
								postToUpdate.dislikeCount += isDisliked ? 1 : -1;
							}

							// Update the isLiked and isDisliked fields
							postToUpdate.like.isLiked = isLiked;
							postToUpdate.like.isDisliked = isDisliked;
						}
					})
				);
				const patchPostResult = dispatch(
					api.util.updateQueryData("getPostById", post_id, (draftPost) => {
						if (draftPost) {
							if (draftPost.like.isLiked !== isLiked) {
								draftPost.likeCount += isLiked ? 1 : -1;
							} else if (!draftPost.like.isDisliked !== isDisliked) {
								draftPost.dislikeCount += isDisliked ? 1 : -1;
							}

							// Update the isLiked and isDisliked fields
							draftPost.like.isLiked = isLiked;
							draftPost.like.isDisliked = isDisliked;
						}
					})
				);
				try {
					await queryFulfilled;
				} catch {
					patchPostsResult.undo();
					patchPostResult.undo();
				}
			},
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

	useGetUserQuery,
	useLoginMutation,
	useCreateUserMutation,

	useLikeOrDislikeMutation,
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
