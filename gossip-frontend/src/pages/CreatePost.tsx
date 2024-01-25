import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import {
	Box,
	Button,
	Chip,
	TextField,
	Typography,
	useTheme,
} from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import CornerButtons from "../components/CornerButtons";
import TagDialog from "../components/Dialogs/TagDialog";
import Loading from "../components/Loading";
import { AnimationContext } from "../components/Wrappers/AnimationWrapper";
import { useCreatePostMutation, useGetTagsQuery } from "../redux/api";
import { PostForm, Tag } from "../types/posts.interface";
import { errorHandle } from "../utils/helper";

function CreatePost() {
	const theme = useTheme();

	const { data: allTags, isLoading, error } = useGetTagsQuery();

	const [tagList, setTagList] = useState<Tag[]>([]);

	const [dialogOpen, setDialogOpen] = useState(false);

	const [title, setTitle] = useState("");
	const [titleError, setTitleError] = useState("");

	const [content, setContent] = useState("");

	const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const newValue = e.target.value;
		if (newValue.length > 42) {
			setTitleError("Title cannot be any longer than 80 characters");
		} else {
			setTitle(newValue);
			setTitleError("");
		}
	};

	const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const newValue = e.target.value;
		setContent(newValue);
	};

	const [createPost] = useCreatePostMutation();

	const navigate = useContext(AnimationContext)!;

	useEffect(() => {
		if (error) errorHandle(error, "Tags");
	}, [error]);

	const handleDialogOpen = () => {
		setDialogOpen(true);
	};
	const handleDialogClose = () => {
		setDialogOpen(false);
	};

	const handleDeleteTag = (tag: Tag) => {
		setTagList(tagList.filter((x) => x.id !== tag.id));
	};

	const handleSelectTag = (tag: Tag) => {
		setTagList(tagList.concat(tag));
	};

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		const postFormData: PostForm = {
			title: title,
			content: content,
			tags: tagList,
		};

		createPost(postFormData)
			.unwrap()
			.then((payload) => {
				toast(payload.message);
				navigate("/");
			})
			.catch((e) => errorHandle(e, "Post creation"));

		e.preventDefault();
	};

	const filteredAvailableTags = (allTags || [])
		.filter((tag) => tagList.every((x) => x.id !== tag.id))
		.sort((a, b) => a.id - b.id);

	return (
		<Box
			sx={{
				backgroundColor: `${theme.palette.background.default}`,
				height: "100%",
				display: "flex",
				justifyContent: "center",
				overflowY: "hidden",
			}}
		>
			<TagDialog
				availableTags={filteredAvailableTags}
				selectedTags={tagList}
				handleClose={handleDialogClose}
				handleSelectTag={handleSelectTag}
				open={dialogOpen}
				isLoading={isLoading}
				isAdd={true}
			/>
			{/* Home Button */}
			<CornerButtons isHomeButton={true} />

			<Box
				component="form"
				onSubmit={handleSubmit}
				sx={{
					height: { xs: "100%", sm: "auto" },
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					position: "relative",
				}}
			>
				{/* TITLE */}
				<Typography
					variant="h3"
					sx={{
						color: `${theme.palette.text.primary}`,
						margin: { xs: "0", sm: "20px 0 20px 0" },
					}}
				>
					Post
				</Typography>

				<TextField
					id="title"
					label="Title"
					sx={{
						width: { xs: "calc(100vw - 10px)", sm: "500px" },
						marginBottom: "20px",
						marginTop: { xs: "10px", sm: "0px" },
					}}
					autoComplete="off"
					required
					value={title}
					onChange={handleTitleChange}
					error={!!titleError}
					helperText={titleError}
				/>
				<TextField
					id="content"
					label="Content"
					sx={{
						width: { xs: "calc(100vw - 10px)", sm: "500px" },

						"& .MuiInputBase-root": {
							borderRadius: "4px 4px 0px 0px",
							height: "100%",
						},
						flexGrow: 1,
					}}
					inputProps={{
						sx: {
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
						},
						style: {
							height: "100%",
						},
					}}
					multiline
					rows={8}
					autoComplete="off"
					required
					value={content}
					onChange={handleContentChange}
				/>
				<Box
					sx={{
						width: { xs: "calc(100vw - 32px)", sm: "478px" },
						display: "flex",
						border: "1px solid",
						borderTop: "1px hidden",
						borderColor: theme.palette.action.disabled,
						borderRadius: "0px 0px 4px 4px",
						":hover": {
							borderTop: "1px solid",
							marginTop: "-1px",
							borderColor: theme.palette.action.active,
							cursor: "pointer",
						},
						padding: "10px",
						gap: "10px",
						flexWrap: "wrap",
						marginBottom: "20px",
					}}
					onClick={handleDialogOpen}
				>
					<LocalOfferIcon
						sx={{
							width: "32px",
							height: "32px",
							color: theme.palette.action.active,
						}}
					/>
					{isLoading && <Loading size={30} />}
					{tagList.map((tag) => (
						<Chip
							label={tag.description}
							key={tag.id}
							onDelete={() => {
								handleDeleteTag(tag);
							}}
						/>
					))}
				</Box>
				<Button
					sx={{
						margin: { xs: "auto 0 5px 0", sm: "0 0 20px 0" },
						width: { xs: "calc(100vw - 10px)", sm: "500px" },
						":active": {
							backgroundColor: theme.palette.action.disabled,
						},
						transition: "all 0s",
						height: { xs: "100px", sm: "auto" },
						minHeight: "10px",
					}}
					type="submit"
					variant="outlined"
					disableRipple
				>
					Submit
				</Button>
			</Box>
		</Box>
	);
}

export default CreatePost;
