import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	TextField,
} from "@mui/material";
import { ChangeEvent, useEffect, useState } from "react";

interface ReplyDialogProps {
	open: boolean;
	handleClose: (success: boolean, replyContent: string) => void;
	value?: string;
}
function ReplyDialog(props: ReplyDialogProps) {
	const { open, handleClose, value } = props;
	const [replyContent, setReplyContent] = useState(value || "");

	const [error, setError] = useState("");

	const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
		const newValue = e.target.value;
		setReplyContent(newValue);
		setError("");
	};

	const handleSubmit = () => {
		if (replyContent.length === 0) {
			setError("");
			return;
		}

		setError("");
		setReplyContent(value || "");

		handleClose(true, replyContent.trim());
	};

	return (
		<Dialog
			component="form"
			onKeyDown={(e) => {
				if (e.key === "Enter") {
					handleSubmit();
					e.preventDefault();
				}
			}}
			onSubmit={(e) => {
				e.preventDefault();
				handleSubmit();
			}}
			open={open}
			onClose={() => handleClose(false, "")}
			fullWidth={true}
		>
			<DialogTitle>Write a reply</DialogTitle>
			<DialogContent>
				<TextField
					type="text"
					autoFocus
					margin="dense"
					id="reply"
					label="Reply"
					fullWidth
					variant="standard"
					onChange={handleChange}
					error={!!error}
					helperText={error}
					autoComplete="off"
					defaultValue={value || ""}
					value={replyContent}
					multiline
					focused
				/>
			</DialogContent>
			<DialogActions>
				<Button
					onClick={() => {
						setReplyContent("");
						handleClose(false, "");
					}}
				>
					Cancel
				</Button>
				<Button
					onClick={() => {
						if (replyContent.length === 0) {
							setError("Cannot be empty!");
							return;
						}

						handleSubmit();
					}}
				>
					Submit
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export default ReplyDialog;
