import {
	Box,
	Chip,
	Paper,
	Popover,
	SxProps,
	Tooltip,
	Typography,
	useMediaQuery,
	useTheme,
} from "@mui/material";
import React, { useContext, useState } from "react";
import { PostMini } from "../../types/posts.interface";
import HeartButton from "../Buttons/HeartButton";
import CommentIcon from "@mui/icons-material/Comment";
import { RelativeToNow } from "../../utils/time";
import {
	useDeletePostMutation,
	useGetUserQuery,
	useLikeOrDislikeMutation,
} from "../../redux/api";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import toast from "react-hot-toast";
import DeleteDialog from "../Dialogs/DeleteDialog";
import { AnimationContext } from "../Wrappers/AnimationWrapper";
import { errorHandle } from "../../utils/helper";

interface DisplayCardProps {
	sx?: SxProps;
	id: number;
	post: PostMini;
}

function DisplayCard(props: DisplayCardProps) {
	const { id, post } = props;

	const theme = useTheme();

	const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

	const navigate = useContext(AnimationContext)!;

	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

	const open = Boolean(anchorEl);

	const [likeOrDislike] = useLikeOrDislikeMutation();

	const [deletePost] = useDeletePostMutation();

	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

	const tagList = post.tags;

	const { data: user } = useGetUserQuery();

	const isOwner = user ? user.id === post.owner.id : false;

	const hasEditPerms = user
		? user.id === post.owner.id ||
		  user.role === "superuser" ||
		  user.role === "admin"
		: false;

	const tagLimit: number = hasEditPerms ? 3 : 4 - (isSmall ? 1 : 0);

	// Listeners
	const handlePopoverOpen = (e: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(e.currentTarget);
	};

	const handlePopoverClose = () => {
		setAnchorEl(null);
	};

	const handleCardClick = () => {
		navigate(`/view/${id}`);
	};

	const handleReplyClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		// open the page but it auto opens the reply
		navigate(`/view/${id}?reply=true`);
	};

	const handleHeartClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (isOwner) return;
		if (post.like.isLiked) {
			likeOrDislike({
				isLiked: false,
				isDisliked: false,
				post_id: post.id,
			})
				.unwrap()
				.then((payload) => toast(payload.message))
				.catch((e) => errorHandle(e, "Like"));
		} else {
			likeOrDislike({
				isLiked: true,
				isDisliked: false,
				post_id: post.id,
			})
				.unwrap()
				.then((payload) => toast(payload.message))
				.catch((e) => errorHandle(e, "Like"));
		}
	};

	const handleEditClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		navigate(`/edit/${id}`);
	};

	const handleDeleteClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		setDeleteDialogOpen(true);
	};

	const handleResult = (confirm: boolean) => {
		setDeleteDialogOpen(false);
		if (confirm) {
			deletePost(id)
				.unwrap()
				.then((payload) => toast(payload.message))
				.catch((e) => errorHandle(e, "Post deletion"));
		}
	};

	return (
		<Box
			sx={{
				position: "relative",
			}}
		>
			<DeleteDialog
				open={deleteDialogOpen}
				handleResult={handleResult}
				message="post"
			/>
			<Paper
				component="button"
				onClick={handleCardClick}
				sx={{
					...props.sx,
					userSelect: "none",
					padding: "10px 20px 10px 20px",
					border: "1px solid",
					borderRadius: { xs: 0, sm: 0, md: "4px" },
					borderColor: `${theme.palette.divider}`,
					backgroundColor: `${theme.palette.action}`,
					transition: "background-color 0.3s ease",
					":hover": {
						backgroundColor: `${theme.palette.action.hover}`,
						transition: "background-color 0.1s ease",
						cursor: "pointer",
					},
					height: "225px",
					width: "100%",
					position: "relative",
				}}
			>
				<Box
					sx={{
						display: "flex",
						flexDirection: "column",
						justifyContent: "space-between",
						height: "100%",
					}}
				>
					<Box
						sx={{
							display: "flex",
							flexDirection: "column",
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
								variant="body2"
								sx={{ color: `${theme.palette.text.secondary}` }}
							>
								{post.owner.username}
							</Typography>
							<Typography
								variant="body2"
								sx={{ color: `${theme.palette.text.secondary}` }}
							>
								{RelativeToNow(post.created_at)}
							</Typography>
						</Box>
						<Typography
							variant="h6"
							sx={{
								color: `${theme.palette.text.primary}`,
								width: "100%",
								marginTop: "5px",
							}}
							align="left"
							noWrap
						>
							{post.title}
						</Typography>
						<Typography
							variant="body1"
							align="justify"
							sx={{
								fontWeight: "bold",
								background: `-webkit-linear-gradient(${theme.palette.text.secondary}, ${theme.palette.action.disabled})`,
								WebkitBackgroundClip: "text",
								WebkitTextFillColor: "transparent",
								overflowY: "hidden",
								display: "-webkit-box",
								overflow: "hidden",
								WebkitBoxOrient: "vertical",
								WebkitLineClamp: 3,
								wordBreak: "break-word",
								marginTop: "10px",
							}}
						>
							{post.content}
						</Typography>
					</Box>

					<Box
						sx={{
							marginTop: "20px",
							width: "100%",
							display: "flex",
							flexDirection: "row",
							justifyContent: "space-between",
						}}
					>
						<Box
							sx={{
								display: "flex",
								gap: "10px",
								justifyContent: "left",
								flexWrap: "nowrap",
								overflowX: "hidden",
							}}
						>
							{(tagList.length > tagLimit
								? tagList.slice(0, tagLimit - 1)
								: tagList
							).map((tag) => (
								<Chip
									label={tag.description}
									key={tag.id}
									sx={{
										pointerEvents: "none",
									}}
								/>
							))}

							{tagList.length > tagLimit && (
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

							{tagList.length > tagLimit && (
								<Popover
									open={open}
									anchorEl={anchorEl}
									anchorOrigin={{
										vertical: "top",
										horizontal: "right",
									}}
									transformOrigin={{
										vertical: "top",
										horizontal: "left",
									}}
									disableRestoreFocus
									sx={{ pointerEvents: "none" }}
								>
									<Box
										sx={{
											display: "flex",
											flexDirection: "column",
											padding: "5px",
											gap: "5px",
										}}
									>
										{tagList.slice(tagLimit - 1).map((tag) => (
											<Chip label={tag.description} key={tag.id} />
										))}
									</Box>
								</Popover>
							)}
						</Box>
						<Box sx={{ display: "flex" }}>
							<HeartButton
								filled={post.like.isLiked || isOwner}
								handleClick={handleHeartClick}
								playAnimation={!isOwner}
							/>
							<Typography
								alignSelf="center"
								variant="h6"
								sx={{
									color: `${theme.palette.text.primary}`,
									marginX: "10px",
									paddingBottom: "5px",
								}}
							>
								{Intl.NumberFormat("en-US", {
									notation: "compact",
									maximumFractionDigits: 1,
								}).format(post.likeCount)}
							</Typography>
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
									}).format(post.replyCount)}
								</Typography>
							</Box>
							{hasEditPerms && (
								<Box sx={{ display: "flex", gap: "10px", marginLeft: "10px" }}>
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
								</Box>
							)}
						</Box>
					</Box>
				</Box>
			</Paper>
		</Box>
	);
}

export default DisplayCard;
