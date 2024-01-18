import ThumbDownAltIcon from "@mui/icons-material/ThumbDownAlt";
import ThumbDownAltOutlinedIcon from "@mui/icons-material/ThumbDownAltOutlined";
import { Box, Tooltip, useTheme } from "@mui/material";

interface DislikeButtonProps {
	handleClick: () => void;
	filled: boolean;
	playAnimation: boolean;
}

function DislikeButton(props: DislikeButtonProps) {
	const theme = useTheme();

	const { handleClick, filled, playAnimation } = props;

	return (
		<Tooltip title="Dislike">
			<Box
				sx={{
					...(playAnimation
						? {
								":hover": {
									transform: "scale(1.4)",
									transition: "transform 0.3s ease",
									cursor: "pointer",
								},
								transition: "transform 0.5s ease, color 0.3s ease",
						  }
						: {
								":hover": {
									cursor: "default",
								},
						  }),
					color: `${theme.palette.warning.main}`,
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
