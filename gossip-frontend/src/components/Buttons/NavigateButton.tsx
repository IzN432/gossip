import CampaignIcon from "@mui/icons-material/Campaign";
import HomeIcon from "@mui/icons-material/Home";
import { Box, IconButton, SxProps, Tooltip, useTheme } from "@mui/material";
import { useContext } from "react";
import { AnimationContext } from "../Wrappers/AnimationWrapper";

interface NavigateButtonProps {
	isHomeButton: boolean;
	sx?: SxProps;
}

// ONLY WORKS IN COMPONENTS WRAPPED IN ANIMATION WRAPPER

function NavigateButton(props: NavigateButtonProps) {
	const { isHomeButton, sx } = props;

	const navigate = useContext(AnimationContext)!;

	const handleClick = () => {
		isHomeButton ? navigate("/") : navigate("/create");
	};

	const theme = useTheme();

	return (
		<Box
			sx={{
				position: "absolute",
				top: "20px",
				left: "30px",
				display: "flex",
				gap: "20px",
				alignItems: "center",
				zIndex: "1",
				...sx,
			}}
		>
			<Tooltip title={isHomeButton ? "Home" : "Post"}>
				<IconButton
					sx={{
						":active": {
							color: `${theme.palette.text.secondary}`,
							transition: "color 0.1s ease",
						},
						":hover": {
							transform: "scale(1.4)",
							transition: "transform 0.3s ease",
						},
						transition: "color 0.3s ease, transform 0.3s ease",
						width: "48px",
						height: "48px",
					}}
					onClick={handleClick}
					disableRipple
				>
					{isHomeButton ? (
						<HomeIcon
							sx={{
								width: "48px",
								height: "48px",
							}}
						/>
					) : (
						<CampaignIcon
							sx={{
								width: "48px",
								height: "48px",
							}}
						/>
					)}
				</IconButton>
			</Tooltip>
		</Box>
	);
}

export default NavigateButton;
