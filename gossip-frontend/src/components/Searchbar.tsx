import {
	IconButton,
	InputBase,
	Paper,
	SxProps,
	Typography,
	useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import { useEffect, useState } from "react";
import { Tag } from "../types/posts.interface";
import TagDialog from "./Dialogs/TagDialog";
import { useGetTagsQuery } from "../redux/api";
import { errorHandle } from "../utils/helper";

function Searchbar(props: {
	sx?: SxProps;
	executeSearch: (search: string) => void;
	handleSelectTag: (tag: Tag) => void;
	initialValue: string;
	tagList: Tag[];
}) {
	const { initialValue, executeSearch, handleSelectTag, tagList } = props;

	const [dialogOpen, setDialogOpen] = useState(false);

	const { data: availableTags, isLoading, error } = useGetTagsQuery();

	const [sortedTags, setSortedTags] = useState<Tag[]>([]);

	useEffect(() => {
		if (error) errorHandle(error, "Tags");
	}, [error]);

	useEffect(() => {
		if (availableTags)
			setSortedTags(
				availableTags.slice().sort((a: Tag, b: Tag) => {
					return (
						(tagList.find((t) => t.id === b.id) ? 1 : 0) -
							(tagList.find((t) => t.id === a.id) ? 1 : 0) ||
						b.postCount - a.postCount
					);
				})
			);
	}, [availableTags]);

	const handleDialogOpen = () => {
		setSortedTags(
			sortedTags.slice().sort((a: Tag, b: Tag) => {
				return (
					(tagList.find((t) => t.id === b.id) ? 1 : 0) -
						(tagList.find((t) => t.id === a.id) ? 1 : 0) ||
					b.postCount - a.postCount
				);
			})
		);
		setDialogOpen(true);
	};
	const handleDialogClose = () => {
		setDialogOpen(false);
	};

	const handleSearchChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		executeSearch(e.currentTarget.value);
	};

	const theme = useTheme();

	return (
		<>
			<TagDialog
				availableTags={sortedTags}
				selectedTags={tagList}
				handleClose={handleDialogClose}
				handleSelectTag={handleSelectTag}
				open={dialogOpen}
				isLoading={isLoading}
			/>

			<Paper
				component="form"
				onSubmit={(e) => {
					e.preventDefault();
				}}
				sx={{
					...props.sx,
					// set the children to be transparent
					"> :not(style)": {
						backgroundColor: "rgba(0,0,0,0)",
					},
					"&:hover": {
						backgroundColor: `${theme.palette.action.hover}`,
						transition: "background-color 0.3s ease",
					},
					transition: "background-color 0.5s ease",
					borderRadius: "10px",
					display: "flex",
					gap: "10px",
				}}
			>
				<IconButton
					type="button"
					sx={{
						backgroundColor: `${theme.palette.background}`,
						borderRadius: "10px 0px 0px 10px",
					}}
				>
					<SearchIcon />
				</IconButton>
				<InputBase
					name="searchString"
					autoComplete="off"
					placeholder="Search..."
					sx={{
						width: "100%",
						borderRadius: "10px",
						backgroundColor: `${theme.palette.background}`,
					}}
					onChange={handleSearchChange}
					defaultValue={initialValue}
				/>

				<IconButton
					type="button"
					onClick={handleDialogOpen}
					sx={{
						backgroundColor: `${theme.palette.background}`,
						borderRadius: "0px 10px 10px 0px",
					}}
				>
					<Typography
						variant="body1"
						sx={{ color: theme.palette.text.secondary, margin: "0 10px 0 5px" }}
					>
						{tagList.length} tags
					</Typography>
					<LocalOfferIcon />
				</IconButton>
			</Paper>
		</>
	);
}

export default Searchbar;
