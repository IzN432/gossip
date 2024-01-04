import {
	Box,
	Card,
	SxProps,
	Tooltip,
	Typography,
	useTheme,
} from "@mui/material";
import { Reply } from "../../types/posts.interface";
import { RelativeToNow } from "../../utils/time";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useState } from "react";
import {
	useDeleteReplyMutation,
	useEditReplyMutation,
	useGetUserQuery,
} from "../../redux/api";
import DeleteDialog from "../Dialogs/DeleteDialog";
import toast from "react-hot-toast";
import ReplyDialog from "../Dialogs/ReplyDialog";
import { errorHandle } from "../../utils/helper";

interface ReplyCardProps {
	reply: Reply;
	refetch: any;
	sx?: SxProps;
}

function ReplyCard(props: ReplyCardProps) {
	const { reply, refetch, sx } = props;
	const { id, content, owner, created_at, post_id } = reply;

	const theme = useTheme();

	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [replyDialogOpen, setReplyDialogOpen] = useState(false);

	const [editReply] = useEditReplyMutation();
	const [deleteReply] = useDeleteReplyMutation();

	const { data: user } = useGetUserQuery();

	const hasEditPerm = user
		? user.id === owner.id || user.role === "superuser" || user.role === "admin"
		: false;

	const handleEditClick = () => {
		setReplyDialogOpen(true);
	};

	const handleDeleteClick = () => {
		setDeleteDialogOpen(true);
	};

	const handleDialogClose = (success: boolean, replyContent: string) => {
		setReplyDialogOpen(false);

		// send a post request to create a new reply
		if (success) {
			editReply({ id: id, content: replyContent, post_id: post_id })
				.unwrap()
				.then(() => refetch())
				.catch((e) => errorHandle(e, "Reply deletion"));
		}
	};

	const handleResult = (confirm: boolean) => {
		setDeleteDialogOpen(false);
		if (confirm) {
			deleteReply(id)
				.unwrap()
				.then((payload) => {
					toast(payload.message);
					refetch();
				})
				.catch((e) => errorHandle(e, "Reply deletion"));
		}
	};

	return (
		<Card
			sx={{
				border: "1px solid",
				borderColor: `${theme.palette.divider}`,
				padding: "10px 15px 15px 15px",
				...sx,
			}}
		>
			<DeleteDialog
				open={deleteDialogOpen}
				handleResult={handleResult}
				message="reply"
			/>
			<ReplyDialog
				open={replyDialogOpen}
				handleClose={handleDialogClose}
				value={reply.content}
			/>

			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					marginBottom: "5px",
				}}
			>
				<Typography
					variant="body2"
					sx={{ marginTop: 0, color: theme.palette.text.disabled }}
				>
					{owner.username}
				</Typography>
				<Typography
					variant="body2"
					sx={{ marginTop: 0, color: theme.palette.text.disabled }}
				>
					{RelativeToNow(created_at)}
				</Typography>
			</Box>
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					position: "relative",
				}}
			>
				<Typography
					variant="body1"
					sx={{
						color: theme.palette.text.primary,
						width: hasEditPerm ? "calc(100% - 100px)" : "100%",
						wordBreak: "break-word",
					}}
				>
					{content}
				</Typography>
				{hasEditPerm && (
					<Box
						sx={{
							display: "flex",
							gap: "10px",
							alignItems: "end",
							marginTop: "10px",
						}}
					>
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
		</Card>
	);
}

export default ReplyCard;
