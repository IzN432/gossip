import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
} from "@mui/material";

interface DeleteDialogProps {
	handleResult: (confirm: boolean) => void;
	open: boolean;
	message: string;
}

function DeleteDialog(props: DeleteDialogProps) {
	const { handleResult, open, message } = props;

	return (
		<Dialog open={open} onClose={() => handleResult(false)} fullWidth={true}>
			<DialogTitle>Delete</DialogTitle>
			<DialogContent>
				<DialogContentText>
					Are you sure you want to delete this {message}? Deleting it will get
					rid of all of its contents forever. Do give it some thought, okay?
				</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button onClick={() => handleResult(false)}>Cancel</Button>
				<Button onClick={() => handleResult(true)}>Confirm</Button>
			</DialogActions>
		</Dialog>
	);
}

export default DeleteDialog;
