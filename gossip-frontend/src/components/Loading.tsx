import { Box, CircularProgress, SxProps, useTheme } from "@mui/material";

interface LoadingProps {
	sx?: SxProps;
	size?: number;
}

function Loading({ sx, size }: LoadingProps) {
	const theme = useTheme();

	return (
		<Box
			sx={{
				height: "100%",
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				overflow: "hidden",
				...sx,
			}}
		>
			<Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
				<CircularProgress
					size={size || 40}
					sx={{ color: theme.palette.text.primary }}
				/>
			</Box>
		</Box>
	);
}

export default Loading;
