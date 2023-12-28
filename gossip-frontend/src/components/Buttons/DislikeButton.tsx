import ThumbDownAltIcon from "@mui/icons-material/ThumbDownAlt";
import ThumbDownAltOutlinedIcon from "@mui/icons-material/ThumbDownAltOutlined";
import { Box, Tooltip, useTheme } from "@mui/material";

interface DislikeButtonProps {
	handleClick: () => void;
	filled: boolean;
}

function DislikeButton(props: DislikeButtonProps) {
	const theme = useTheme();

	const { handleClick, filled } = props;

	return (
		<Tooltip title="Dislike">
			<Box
				sx={{
					":hover": {
						transform: "scale(1.4)",
						transition: "transform 0.3s ease",
						cursor: "pointer",
					},
					height: "32px",
					width: "32px",
					color: `${theme.palette.warning.main}`,
					transition: "transform 0.5s ease, color 0.3s ease",
				}}
			>
				{filled ? (
					<ThumbDownAltIcon
						sx={{
							height: "32px",
							width: "32px",
						}}
						onClick={handleClick}
					/>
				) : (
					<ThumbDownAltOutlinedIcon
						sx={{
							height: "32px",
							width: "32px",
						}}
						onClick={handleClick}
					/>
				)}
			</Box>
		</Tooltip>
	);
}

export default DislikeButton;
