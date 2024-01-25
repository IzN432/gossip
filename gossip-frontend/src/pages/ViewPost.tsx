import CommentIcon from "@mui/icons-material/Comment";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
	Box,
	Chip,
	Fade,
	Paper,
	Popper,
	Tooltip,
	Typography,
	useMediaQuery,
	useTheme,
} from "@mui/material";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams, useSearchParams } from "react-router-dom";
import DislikeButton from "../components/Buttons/DislikeButton";
import HeartButton from "../components/Buttons/HeartButton";
import ReplyCard from "../components/Cards/ReplyCard";
import CornerButtons from "../components/CornerButtons";
import DeleteDialog from "../components/Dialogs/DeleteDialog";
import ReplyDialog from "../components/Dialogs/ReplyDialog";
import Loading from "../components/Loading";
import { AnimationContext } from "../components/Wrappers/AnimationWrapper";
import {
	useCreateReplyMutation,
	useDeletePostMutation,
	useGetPostByIdQuery,
	useGetRepliesByPostIDQuery,
	useGetUserQuery,
	useLikeOrDislikeMutation,
} from "../redux/api";
import { errorHandle } from "../utils/helper";
import { CompareDates, RelativeToNow } from "../utils/time";

function ViewPost() {
	const theme = useTheme();
	const isLarge = useMediaQuery(theme.breakpoints.down("lg"));
	const isSmall = useMediaQuery(theme.breakpoints.down("md"));

	// retrieve post id
	const { id } = useParams();

	const [searchParams] = useSearchParams();

	const reply = searchParams.get("reply");

	const navigate = useContext(AnimationContext)!;

	// retrieve user
	const { data: user } = useGetUserQuery();

	// send request to retrieve the post
	const {
		data: post,
		refetch: refetchPost,
		isLoading,
		error,
	} = useGetPostByIdQuery(parseInt(id!));

	const {
		data: replies,
		refetch: refetchReplies,
		isLoading: repliesLoading,
		error: repliesError,
	} = useGetRepliesByPostIDQuery(parseInt(id!));

	const [createReply] = useCreateReplyMutation();

	const [replyDialogOpen, setReplyDialogOpen] = useState(Boolean(reply));
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

	const [deletePost] = useDeletePostMutation();
	const [likeOrDislike] = useLikeOrDislikeMutation();

	// Popover
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const open = Boolean(anchorEl);

	const isOwner = user ? post?.owner.id === user.id : false;

	const hasEditPerms = user
		? post?.owner.id === user.id ||
		  user.role === "admin" ||
		  user.role === "superuser"
		: false;

	const tagLimit: number = isSmall && hasEditPerms ? 4 : isSmall ? 1 : 4;

	//  listener functions
	const handleHeartClick = () => {
		if (isOwner) {
			return;
		}
		if (post!.like.isLiked) {
			likeOrDislike({ isLiked: false, isDisliked: false, post_id: post!.id })
				.unwrap()
				.then((payload) => toast(payload.message))
				.catch((e) => errorHandle(e, "Like"));
		} else {
			likeOrDislike({ isLiked: true, isDisliked: false, post_id: post!.id })
				.unwrap()
				.then((payload) => toast(payload.message))
				.catch((e) => errorHandle(e, "Like"));
		}
	};

	const handleDislikeClick = () => {
		if (isOwner) {
			return;
		}
		if (post!.like.isDisliked) {
			likeOrDislike({ isLiked: false, isDisliked: false, post_id: post!.id })
				.unwrap()
				.then((payload) => toast(payload.message))
				.catch((e) => errorHandle(e, "Like"));
		} else {
			likeOrDislike({ isLiked: false, isDisliked: true, post_id: post!.id })
				.unwrap()
				.then((payload) => toast(payload.message))
				.catch((e) => errorHandle(e, "Like"));
		}
	};

	const handleReplyClick = () => {
		setReplyDialogOpen(true);
	};

	const handleEditClick = () => {
		navigate(`/edit/${id}`);
	};

	const handleDeleteClick = () => {
		setDeleteDialogOpen(true);
	};

	const handlePopoverOpen = (e: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(e.currentTarget);
	};

	const handlePopoverClose = () => {
		setAnchorEl(null);
	};
	const handleDialogClose = (success: boolean, replyContent: string) => {
		setReplyDialogOpen(false);

		// send a post request to create a new reply
		if (success) {
			createReply({ content: replyContent, post_id: parseInt(id!) })
				.unwrap()
				.then((payload) => {
					toast(payload.message);
					refetchPost();
				});
		}
	};
	const handleResult = (confirm: boolean) => {
		setDeleteDialogOpen(false);
		if (confirm) {
			deletePost(post!.id)
				.unwrap()
				.then((payload) => toast(payload.message))
				.catch((e) => errorHandle(e, "Post deletion"));
			navigate("/");
		}
	};

	useEffect(() => {
		if (error) {
			errorHandle(error, "Post");
			navigate("/");
		}
	}, [error, navigate]);

	useEffect(() => {
		if (repliesError) {
			errorHandle(repliesError, "Replies");
		}
	}, [repliesError]);

	return !user || isLoading ? (
		<Loading />
	) : (
		<>
			<DeleteDialog
				open={deleteDialogOpen}
				handleResult={handleResult}
				message="post"
			/>
			<ReplyDialog open={replyDialogOpen} handleClose={handleDialogClose} />

			<Box
				sx={{
					backgroundColor: `${theme.palette.background.default}`,
					maxHeight: "100%",
					height: "auto",
					display: "flex",
					justifyContent: "center",
				}}
			>
				<CornerButtons isHomeButton={true} />

				<Box
					sx={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						position: "relative",
						marginTop: { xs: 0, md: "20px" },
					}}
				>
					{/* TITLE */}
					{isLarge && (
						<Typography
							variant="h3"
							sx={{
								color: `${theme.palette.text.primary}`,
								marginBottom: { xs: 0, md: "20px" },
							}}
						>
							Gossip
						</Typography>
					)}
					<Box
						sx={{
							maxHeight: "100%",
							height: "auto",
							display: "flex",
							flexDirection: "column",
							overflowY: "auto",
						}}
					>
						<Paper
							sx={{
								border: "1px solid",
								borderColor: `${theme.palette.divider}`,
								width: { xs: "calc(100vw - 40px)", lg: "808px" },
								borderRadius: { xs: 0, lg: "4px" },
								padding: "10px 20px 10px 20px",
							}}
						>
							<Box
								sx={{
									display: "flex",
									justifyContent: "space-between",
									width: "100%",
								}}
							>
								<Typography
									variant="body1"
									sx={{
										color: `${theme.palette.text.secondary}`,
									}}
								>
									{post!.owner.username}
								</Typography>

								<Typography
									variant="body1"
									sx={{
										color: `${theme.palette.text.secondary}`,
									}}
								>
									{RelativeToNow(post!.created_at)}
								</Typography>
							</Box>

							<Typography
								variant="h5"
								sx={{
									color: `${theme.palette.text.primary}`,
									marginY: "10px",
								}}
							>
								{post!.title}
							</Typography>
							<Box
								sx={{
									overflowY: "auto",
									maxHeight: { xs: "100%", lg: "200px" },
									paddingRight: "10px",
									"::-webkit-scrollbar": { width: "10px" },
									"::-webkit-scrollbar-track": {
										background: "rgba(255,255,255,0.1)",
										borderRadius: "10px",
									},
									"::-webkit-scrollbar-thumb": {
										background: "#888",
										borderRadius: "10px",
									},
									"::-webkit-scrollbar-thumb:hover": {
										background: "#555",
									},
									scrollbarWidth: "thin",
								}}
							>
								<Typography
									variant="body1"
									sx={{
										marginTop: "5px",
										color: `${theme.palette.text.secondary}`,
										wordBreak: "break-word",
									}}
									align="justify"
								>
									{post!.content}
								</Typography>
							</Box>
							<Box
								sx={{
									display: "flex",
									flexDirection: {
										xs: hasEditPerms ? "column" : "row",
										sm: "row",
									},
									gap: { xs: "20px", sm: "0px" },
									marginTop: "20px",
									justifyContent: "space-between",
								}}
							>
								<Box sx={{ display: "flex", gap: "20px" }}>
									{(post!.tags.length > tagLimit
										? post!.tags.slice(0, tagLimit - 1)
										: post!.tags
									).map((tag) => (
										<Chip
											label={tag.description}
											key={tag.id}
											sx={{
												pointerEvents: "none",
											}}
										/>
									))}

									{post!.tags.length > tagLimit && (
										<Chip
											label={tagLimit === 1 ? "tags" : "others"}
											color="error"
											sx={{
												":hover": {
													cursor: "grab",
												},
											}}
											onMouseEnter={handlePopoverOpen}
											onMouseLeave={handlePopoverClose}
										/>
									)}

									{post!.tags.length > tagLimit && (
										<Popper
											open={open}
											anchorEl={anchorEl}
											sx={{ zIndex: 1, pointerEvents: "none" }}
											placement="right-start"
											transition
											disablePortal
										>
											{({ TransitionProps }) => (
												<Fade {...TransitionProps} timeout={350}>
													<Paper
														elevation={8}
														sx={{
															backgroundColor: `${theme.palette.background.paper}`,
															display: "flex",
															flexDirection: "column",
															padding: "5px",
															gap: "5px",
														}}
													>
														{post!.tags.slice(tagLimit - 1).map((tag) => (
															<Chip label={tag.description} key={tag.id} />
														))}
													</Paper>
												</Fade>
											)}
										</Popper>
									)}
								</Box>
								<Box
									sx={{
										display: "flex",
										justifyContent: "start",
										gap: "20px",
									}}
								>
									<Box
										sx={{
											display: "flex",
										}}
									>
										<HeartButton
											filled={post!.like.isLiked || isOwner}
											handleClick={handleHeartClick}
											playAnimation={!isOwner}
										/>
										<Typography
											alignSelf="center"
											variant="h6"
											sx={{
												color: `${theme.palette.text.primary}`,
												marginLeft: "10px",
												paddingBottom: "5px",
											}}
										>
											{Intl.NumberFormat("en-US", {
												notation: "compact",
												maximumFractionDigits: 1,
											}).format(post!.likeCount)}
										</Typography>
									</Box>
									<Box sx={{ display: "flex" }}>
										<DislikeButton
											filled={post!.like.isDisliked || isOwner}
											handleClick={handleDislikeClick}
											playAnimation={!isOwner}
										/>
										<Typography
											alignSelf="center"
											variant="h6"
											sx={{
												color: `${theme.palette.text.primary}`,
												marginLeft: "10px",
												paddingBottom: "5px",
											}}
										>
											{Intl.NumberFormat("en-US", {
												notation: "compact",
												maximumFractionDigits: 1,
											}).format(post!.dislikeCount)}
										</Typography>
									</Box>
									<Box
										sx={{
											display: "flex",
										}}
									>
										<Tooltip title="Reply">
											<CommentIcon
												sx={{
													":hover": {
														transform: "scale(1.4)",
														transition: "transform 0.3s ease",
														cursor: "pointer",
													},
													":active": {
														color: `${theme.palette.text.secondary}`,
														transition: "color 0.1s ease",
													},
													color: `${theme.palette.text.primary}`,
													transition: "transform 0.5s ease, color 0.3s ease",

													height: "32px",
													width: "32px",
												}}
												onClick={handleReplyClick}
											/>
										</Tooltip>
										<Typography
											alignSelf="center"
											variant="h6"
											sx={{
												color: `${theme.palette.text.primary}`,
												marginLeft: "10px",
												paddingBottom: "5px",
											}}
										>
											{Intl.NumberFormat("en-US", {
												notation: "compact",
												maximumFractionDigits: 1,
											}).format(post!.replyCount)}
										</Typography>
									</Box>
									{hasEditPerms && (
										<>
											<Tooltip title="Delete">
												<DeleteIcon
													sx={{
														":hover": {
															transform: "scale(1.4)",
															transition: "transform 0.3s ease",
															cursor: "pointer",
														},
														":active": {
															color: `${theme.palette.error.dark}`,
															transition: "color 0.1s ease",
														},
														color: `${theme.palette.error.main}`,
														transition: "transform 0.5s ease, color 0.3s ease",

														height: "32px",
														width: "32px",
													}}
													onClick={handleDeleteClick}
												/>
											</Tooltip>
											<Tooltip title="Edit">
												<EditIcon
													sx={{
														":hover": {
															transform: "scale(1.4)",
															transition: "transform 0.3s ease",
															cursor: "pointer",
														},
														":active": {
															color: `${theme.palette.warning.dark}`,
															transition: "color 0.1s ease",
														},
														color: `${theme.palette.warning.main}`,
														transition: "transform 0.5s ease, color 0.3s ease",

														height: "32px",
														width: "32px",
													}}
													onClick={handleEditClick}
												/>
											</Tooltip>
										</>
									)}
								</Box>
							</Box>
						</Paper>
						<Box
							sx={{
								width: { xs: "100%", lg: "850px" },
								overflowY: { xs: "visible", lg: "scroll" },
								marginTop: "20px",

								"::-webkit-scrollbar": { width: "10px" },
								"::-webkit-scrollbar-track": {
									background: "rgba(255,255,255,0.1)",
									borderRadius: "10px",
								},
								"::-webkit-scrollbar-thumb": {
									background: "#888",
									borderRadius: "10px",
								},
								"::-webkit-scrollbar-thumb:hover": {
									background: "#555",
								},
								scrollbarWidth: "thin",
								marginBottom: "10px",
								"> :not(:last-child)": {
									marginBottom: "20px",
								},
								"> :not(style)": {
									xs: {
										marginLeft: "auto",
										marginRight: "auto",
									},
									sm: {
										marginLeft: 0,
										marginRight: "auto",
									},
								},
							}}
						>
							{repliesLoading ? (
								<Loading />
							) : (
								[...(replies || [])]
									.sort((a, b) => CompareDates(b.created_at, a.created_at))
									.map((reply) => (
										<ReplyCard
											reply={reply}
											key={reply.id}
											refetch={refetchReplies}
											sx={{
												width: {
													xs: "calc(100% - 40px)",
													lg: "calc(100% - 50px)",
												},
											}}
										/>
									))
							)}
						</Box>
					</Box>
				</Box>
			</Box>
		</>
	);
}

export default ViewPost;
