import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

import {
	Box,
	Button,
	IconButton,
	Link,
	Paper,
	TextField,
	Typography,
	useTheme,
} from "@mui/material";
import { useContext, useState } from "react";
import { AnimationContext } from "../components/Wrappers/AnimationWrapper";
import { useLoginMutation } from "../redux/api";
import { UserLogin } from "../types/posts.interface";
import { errorHandle, errorMessage } from "../utils/helper";
import toast from "react-hot-toast";

function SigninPage() {
	const theme = useTheme();
	const navigate = useContext(AnimationContext)!;

	const [passwordShown, setPasswordShown] = useState(false);

	const [username, setUsername] = useState("");
	const [usernameError, setUsernameError] = useState("");

	const [password, setPassword] = useState("");
	const [passwordError, setPasswordError] = useState("");

	const [login] = useLoginMutation();

	const handleChangeUsername = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		// https://stackoverflow.com/questions/66848152/material-ui-restrict-specific-special-characters-in-textfield

		const newValue = e.target.value;

		if (newValue.match(/^[a-zA-Z0-9_.-]*$/)) {
			setUsernameError("");
			setUsername(newValue); // only set when successful
		} else {
			setUsernameError("No special characters or space allowed");
		}
	};

	const handleChangePassword = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const newValue = e.target.value;

		if (!newValue.match(/^(.*\s+.*)+$/)) {
			setPasswordError("");
			setPassword(newValue); // only set when successful
		} else {
			setPasswordError("No space allowed");
		}
	};

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		const loginForm: UserLogin = {
			username: username,
			password: password,
		};

		const promise = login(loginForm).unwrap();
		toast.promise(promise, {
			loading: "Loading",
			success: (payload) => {
				localStorage.setItem("AuthToken", payload.data.token);
				localStorage.setItem("user", JSON.stringify(payload.data.user));

				const storageEvent = new Event("storage");
				window.dispatchEvent(storageEvent);

				return "Successfully logged in";
			},
			error: (e) => errorMessage(e, "Login"),
		});

		e.preventDefault();
	};

	return (
		<Box
			sx={{
				backgroundColor: `${theme.palette.background.default}`,
				height: "100%",
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				overflowY: "hidden",
			}}
		>
			<Paper
				component="form"
				onSubmit={handleSubmit}
				sx={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					position: "relative",
					gap: "20px",
					borderRadius: 0,
					marginTop: "20px",
					padding: "50px",
					border: "1px solid",
					borderRightWidth: "0px",
					borderLeftWidth: "0px",
					borderColor: theme.palette.action.disabled,
				}}
			>
				{/* TITLE */}
				<Typography
					variant="h3"
					sx={{
						color: `${theme.palette.text.primary}`,
						marginBottom: "20px",
					}}
				>
					Sign in
				</Typography>

				<TextField
					label="Username"
					id="username"
					type="text"
					sx={{ width: "400px", maxWidth: "90vw" }}
					value={username}
					onChange={handleChangeUsername}
					error={!!usernameError}
					helperText={usernameError}
					required
				/>
				<TextField
					label="Password (Optional)"
					id="password"
					type={passwordShown ? "text" : "password"}
					sx={{ width: "400px", maxWidth: "90vw" }}
					InputProps={{
						sx: { paddingRight: "10px" },
						endAdornment: (
							<IconButton
								disableRipple
								sx={{
									marginRight: "0px",
									":hover": {
										color: theme.palette.text.secondary,
									},
								}}
								onClick={() => setPasswordShown(!passwordShown)}
							>
								{passwordShown ? <VisibilityIcon /> : <VisibilityOffIcon />}
							</IconButton>
						),
					}}
					value={password}
					onChange={handleChangePassword}
					error={!!passwordError}
					helperText={passwordError}
				/>

				<Box
					sx={{
						display: "flex",
						alignContent: "start",
						justifyContent: "space-between",
						width: "400px",
						maxWidth: "90vw",
					}}
				>
					<Link
						sx={{ ":hover": { cursor: "pointer" } }}
						onClick={() => navigate("/signup")}
					>
						Create new account
					</Link>
					<Button variant="outlined" type="submit">
						Login
					</Button>
				</Box>
			</Paper>
		</Box>
	);
}

export default SigninPage;
