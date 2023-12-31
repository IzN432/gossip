import { Box } from "@mui/material";
import Loading from "../components/Loading";

function LoadingPage() {
	return (
		<Box sx={{ height: "100%", width: "100vw" }}>
			<Loading sx={{ margin: "auto" }} />
		</Box>
	);
}

export default LoadingPage;
