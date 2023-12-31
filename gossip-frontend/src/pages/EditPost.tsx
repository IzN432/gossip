import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import {
	Box,
	Button,
	Chip,
	TextField,
	Typography,
	useTheme,
} from "@mui/material";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import CornerButtons from "../components/CornerButtons";
import TagDialog from "../components/Dialogs/TagDialog";
import Loading from "../components/Loading";
import { AnimationContext } from "../components/Wrappers/AnimationWrapper";
import {
	useEditPostMutation,
	useGetPostByIdQuery,
	useGetTagsQuery,
} from "../redux/api";
import { PostUpdateForm, Tag } from "../types/posts.interface";
import { getUser } from "../utils/auth";
import { errorHandle } from "../utils/helper";

function EditPost() {
	const { id } = useParams();

	const theme = useTheme();

	const {
		data: allTags,
		isLoading: tagIsLoading,
		error: tagError,
	} = useGetTagsQuery();

	const {
		data: post,
		isLoading: postIsLoading,
		error: postError,
	} = useGetPostByIdQuery(parseInt(id!));

	const [tagList, setTagList] = useState<Tag[]>([]);

	const [dialogOpen, setDialogOpen] = useState(false);

	const [title, setTitle] = useState("");
	const [titleError, setTitleError] = useState("");

	const [content, setContent] = useState("");
	const [contentError, setContentError] = useState("");

	const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const newValue = e.target.value;
		if (newValue.length > 42) {
			setTitleError("Title cannot be any longer than 80 characters");
			if (newValue.length < title.length) {
				setTitle(newValue);
			}
		} else {
			setTitle(newValue);
			setTitleError("");
		}
	};

	const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const newValue = e.target.value;
		if (newValue.length === 0) {
			setContentError("Cannot be empty");
		}
		setContent(e.target.value);
	};
	const [editPost] = useEditPostMutation();

	const navigate = useContext(AnimationContext)!;

	useEffect(() => {
		if (post) {
			setTagList(post.tags);
			setTitle(post.title);
			setContent(post.content);
		}
	}, [post]);

	useEffect(() => {
		if (postError) {
			errorHandle(postError, "Post");
			navigate("/");
		}
	}, [postError]);

	useEffect(() => {
		if (tagError) errorHandle(tagError, "Tags");
	}, [tagError]);

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
		const postFormData: PostUpdateForm = {
			id: parseInt(id!),
			title: title,
			content: content,
			tags: tagList,
			owner: getUser(),
		};

		editPost(postFormData)
			.unwrap()
			.then((payload) => {
				toast(payload.message);
				navigate(`/view/${id}`);
			})
			.catch((e) => errorHandle(e, "Post update"));

		e.preventDefault();
	};

	const filteredAvailableTags = (allTags || []).filter((x) =>
		tagList.every((y) => y.id !== x.id)
	);

	return postIsLoading ? (
		<Loading />
	) : (
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
				isLoading={tagIsLoading}
				isAdd={true}
			/>
			{/* Home Button */}
			<CornerButtons isHomeButton={true} />

			<Box
				component="form"
				onSubmit={handleSubmit}
				sx={{
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
					Update
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
					error={!!contentError}
					helperText={contentError}
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

export default EditPost;
