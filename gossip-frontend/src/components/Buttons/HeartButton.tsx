import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";

import { Box, Tooltip, useTheme } from "@mui/material";

interface HeartButtonProps {
	handleClick: (() => void) | ((e: React.MouseEvent) => void);
	filled: boolean;
	playAnimation: boolean;
}

function HeartButton(props: HeartButtonProps) {
	const theme = useTheme();

	const { handleClick, filled, playAnimation } = props;

	return (
		<Tooltip title="Like">
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
					color: `${theme.palette.error.main}`,
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
