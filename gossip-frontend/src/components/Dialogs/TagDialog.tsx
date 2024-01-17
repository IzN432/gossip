import {
	Dialog,
	useTheme,
	TextField,
	List,
	ListItem,
	ListItemButton,
	ListItemText,
} from "@mui/material";
import { useState } from "react";
import { Tag } from "../../types/posts.interface";
import Loading from "../Loading";
import { capitalizeFirstLetter, errorHandle } from "../../utils/helper";
import { useCreateTagMutation } from "../../redux/api";
import toast from "react-hot-toast";

interface TagDialogProps {
	open: boolean;
	availableTags?: Tag[];
	selectedTags: Tag[];
	handleClose: () => void;
	handleSelectTag: (tag: Tag) => void;
	isLoading?: boolean;
	isAdd?: boolean;
}

function TagDialog(props: TagDialogProps) {
	const {
		open,
		isLoading,
		handleClose,
		availableTags,
		selectedTags,
		handleSelectTag,
		isAdd,
	} = props;

	const theme = useTheme();

	const [searchTerm, setSearchTerm] = useState("");
	const [createTag] = useCreateTagMutation();

	const handleSearchChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		setSearchTerm(e.currentTarget.value);
	};

	const slicedTerm = capitalizeFirstLetter(searchTerm.trim()).slice(0, 10);

	return (
		<Dialog open={open} onClose={handleClose}>
			<TextField
				variant="filled"
				label="Search / New"
				sx={{ margin: "0 1px 0 1px" }}
				onChange={handleSearchChange}
				value={searchTerm}
			/>
			<List
				sx={{
					height: "400px",
					overflowY: "auto",
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
				{isLoading ? (
					<Loading />
				) : (
					<>
						{isAdd &&
							slicedTerm &&
							!(availableTags || []).find(
								(tag) =>
									tag.description.toLowerCase() === slicedTerm.toLowerCase()
							) && (
								<ListItem key={-1} disableGutters>
									<ListItemButton
										onClick={() => {
											createTag({
												description: slicedTerm,
											})
												.unwrap()
												.then((payload) => {
													toast(payload.message);
													handleSelectTag(payload.data);
													setSearchTerm("");
												})
												.catch((e) => errorHandle(e, "Tag"));
										}}
									>
										<ListItemText id="custom" primary={slicedTerm} />
									</ListItemButton>
								</ListItem>
							)}

						{(availableTags || [])
							.filter((tag) =>
								tag.description.toLowerCase().includes(searchTerm.toLowerCase())
							)
							.map((tag) => (
								<ListItem key={tag.id} disableGutters>
									<ListItemButton
										onClick={() => handleSelectTag(tag)}
										sx={
											selectedTags.find((x) => x.id === tag.id) && {
												backgroundColor: theme.palette.action.hover,
												":hover": {
													backgroundColor: theme.palette.action.disabled,
												},
											}
										}
									>
										<ListItemText
											id={tag.description}
											primary={tag.description}
										/>
									</ListItemButton>
								</ListItem>
							))}
					</>
				)}
			</List>
		</Dialog>
	);
}

export default TagDialog;
