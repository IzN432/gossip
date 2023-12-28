import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";

import { Box, Tooltip, useTheme } from "@mui/material";

interface HeartButtonProps {
	handleClick: () => void;
	filled: boolean;
}

function HeartButton(props: HeartButtonProps) {
	const theme = useTheme();

	const { handleClick, filled } = props;

	return (
		<Tooltip title="Like">
			<Box
				sx={{
					":hover": {
						transform: "scale(1.4)",
						transition: "transform 0.3s ease",
						cursor: "pointer",
					},
					color: `${theme.palette.error.main}`,
					transition: "transform 0.5s ease, color 0.3s ease",
				}}
			>
				{filled ? (
					<FavoriteIcon
						sx={{
							height: "32px",
							width: "32px",
						}}
						onClick={handleClick}
					/>
				) : (
					<FavoriteBorderOutlinedIcon
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

export default HeartButton;
