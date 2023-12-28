import {
	Box,
	Button,
	Link,
	Typography,
	useMediaQuery,
	useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";
import DisplayCard from "../components/Cards/DisplayCard";
import Loading from "../components/Loading";
import Searchbar from "../components/Searchbar";
import { useGetPostsQuery } from "../redux/api";
import { PostMini, Tag } from "../types/posts.interface";
import { calculateLikeSort, errorHandle } from "../utils/helper";
import { CompareDates } from "../utils/time";
import CornerButtons from "../components/CornerButtons";

type SortMode = "hot" | "latest";

function Home() {
	const theme = useTheme();
	const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

	const { data: posts, isLoading, error } = useGetPostsQuery();

	const searchSessionValues = JSON.parse(
		sessionStorage.getItem("search") || "{}"
	);

	const [searchTerm, setSearchTerm] = useState(
		searchSessionValues.searchTerm || ""
	);
	const [searchTags, setSearchTags] = useState<Tag[]>(
		searchSessionValues.tags || []
	);

	const [sortMode, setSortMode] = useState<SortMode>(
		searchSessionValues.sortMode || "hot"
	);

	const [isVisible, setVisible] = useState(true);

	const executeSearch = (search: string) => {
		setSearchTerm(search.toLowerCase());
		searchSessionValues.searchTerm = search.toLowerCase();
		sessionStorage.setItem("search", JSON.stringify(searchSessionValues));
	};
	const executeTagSearch = (tagList: Tag[]) => {
		setSearchTags(tagList);
		searchSessionValues.tags = tagList;
		sessionStorage.setItem("search", JSON.stringify(searchSessionValues));
	};

	const handleSelectTag = (tag: Tag) => {
		const updatedTagList = searchTags.find((x) => x.id === tag.id)
			? searchTags.filter((x) => x.id !== tag.id)
			: searchTags.concat(tag);

		setSearchTags(updatedTagList);
		executeTagSearch(updatedTagList);
	};

	const handleSortModeChange = (newSortMode: SortMode) => {
		setVisible(false);
		setTimeout(() => {
			setSortMode(newSortMode);
			setVisible(true);
		}, 500);

		searchSessionValues.sortMode = newSortMode;
		sessionStorage.setItem("search", JSON.stringify(searchSessionValues));
	};

	useEffect(() => {
		if (error) errorHandle(error, "Posts");
	}, [error]);

	const filteredPosts = (posts || [])
		.filter(
			(x) =>
				(x.title.toLowerCase().includes(searchTerm) ||
					x.content.toLowerCase().includes(searchTerm)) &&
				searchTags.every((tag) => x.tags.map((y) => y.id).includes(tag.id))
		)
		.sort((a: PostMini, b: PostMini) =>
			a.title.toLowerCase().includes(searchTerm) &&
			!b.title.toLowerCase().includes(searchTerm)
				? -1
				: b.title.toLowerCase().includes(searchTerm) &&
				  !a.title.toLowerCase().includes(searchTerm)
				? 1
				: sortMode === "latest"
				? CompareDates(a.created_at, b.created_at)
				: calculateLikeSort(a, b) === 0
				? CompareDates(a.created_at, b.created_at)
				: calculateLikeSort(a, b)
		);

	return (
		<>
			<Box
				sx={{
					backgroundColor: `${theme.palette.background.default}`,
					maxHeight: "100vh",
					display: "flex",
					justifyContent: "center",
					overflowY: "hidden",
				}}
			>
				<CornerButtons isHomeButton={false} />

				<Box
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
						Gossip
					</Typography>

					{/* SEARCH BAR */}
					<Searchbar
						executeSearch={executeSearch}
						handleSelectTag={handleSelectTag}
						sx={{
							width: { xs: "100vw", sm: "500px" }, // on hover change background color
						}}
						initialValue={searchSessionValues.searchTerm || ""}
						tagList={searchTags}
					/>
					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
							width: { xs: "calc(100vw - 10px)", sm: "490px" },
						}}
					>
						{!isSmall ? (
							<>
								<Box>
									<Link
										component="button"
										variant="caption"
										sx={{
											color: `${
												sortMode === "latest"
													? theme.palette.text.primary
													: theme.palette.text.secondary
											}`,
											transition: "color 0.5s ease",
											marginY: "2px",
										}}
										onClick={() => handleSortModeChange("latest")}
										fontWeight={sortMode === "latest" ? "bold" : "light"}
									>
										Latest
									</Link>
								</Box>
								<Box>
									<Link
										component="button"
										variant="caption"
										sx={{
											color: `${
												sortMode === "hot"
													? theme.palette.error.main
													: theme.palette.error.dark
											}`,
											transition: "color 0.5s ease",
											marginY: "2px",
										}}
										onClick={() => handleSortModeChange("hot")}
										fontWeight={sortMode === "hot" ? "bold" : "light"}
									>
										Hot
									</Link>
								</Box>
							</>
						) : (
							<>
								<Button
									variant="outlined"
									sx={{
										color: `${theme.palette.text.primary}`,
										transition: "color 0.5s ease",
										margin: "10px 0 2px 0",
									}}
									onClick={() => handleSortModeChange("latest")}
								>
									Latest
								</Button>
								<Button
									sx={{
										color: `${theme.palette.error.main}`,
										transition: "color 0.5s ease",
										margin: "10px 0 2px 0",
									}}
									onClick={() => handleSortModeChange("hot")}
									variant="outlined"
								>
									Hot
								</Button>
							</>
						)}
					</Box>

					{/* CONTENT */}
					<Typography
						variant="caption"
						sx={{
							color: `${theme.palette.text.secondary}`,
							margin: "5px 5px 0px 5px",
							width: { xs: "calc(100vw - 10px)", sm: "490px" },
							height: "20px",
						}}
					>
						{filteredPosts.length} gossips (sorted by {sortMode})
					</Typography>
					<Box
						sx={{
							opacity: isVisible ? 1 : 0,
							transition: "opacity 0.5s ease-in-out",
							"> :not(style)": {
								margin: "0 auto 20px auto",
								width: { xs: "100vw", sm: "500px" },
							},
							"> :last-child": {
								marginBottom: "0px",
							},
							"::-webkit-scrollbar": { display: "none" },
							msOverflowStyle: "none" /* IE and Edge */,
							scrollbarWidth: "none" /* Firefox */,
							width: "100vw",
							overflowY: "scroll",
							alignItems: "center",
							marginBottom: "20px",
						}}
					>
						{isLoading ? (
							<Loading />
						) : (
							filteredPosts.map((post: PostMini) => (
								<DisplayCard id={post.id} key={post.id} post={post} />
							))
						)}
					</Box>
				</Box>
			</Box>
		</>
	);
}

export default Home;
