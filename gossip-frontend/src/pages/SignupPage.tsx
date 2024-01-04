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
import { useCreateUserMutation } from "../redux/api";
import { UserForm } from "../types/posts.interface";
import { errorMessage } from "../utils/helper";
import toast from "react-hot-toast";
import { setToken } from "../utils/auth";

function SignupPage() {
	const theme = useTheme();
	const navigate = useContext(AnimationContext)!;

	const [passwordShown, setPasswordShown] = useState(false);
	const [username, setUsername] = useState("");
	const [usernameError, setUsernameError] = useState("");

	const [password, setPassword] = useState("");
	const [passwordError, setPasswordError] = useState("");

	const [signup] = useCreateUserMutation();

	const handleChangeUsername = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		// https://stackoverflow.com/questions/66848152/material-ui-restrict-specific-special-characters-in-textfield

		const newValue = e.target.value;

		if (!newValue.match(/^[a-zA-Z0-9_.-]*$/)) {
			setUsernameError("No special characters or space allowed");
		} else if (newValue.match(/^[0-9]/)) {
			setUsernameError("Cannot start with number");
		} else {
			setUsernameError("");
			setUsername(newValue); // only set when successful
		}
	};

	const handleChangePassword = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const newValue = e.target.value;

		if (newValue.match(/^(.*\s+.*)+$/)) {
			setPasswordError("No space allowed");
		} else {
			setPasswordError("");
			setPassword(newValue); // only set when successful
		}
	};

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		const signupForm: UserForm = {
			username: username,
			password: password,
			role: "viewer",
		};

		const promise = signup(signupForm).unwrap();
		toast.promise(promise, {
			loading: "Loading",
			success: (payload) => {
				setToken(payload.data.token);
				return "Successfully created new account";
			},
			error: (e) => errorMessage(e, "Account creation"),
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
				alignItems: "center",
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
					width: "500px",
					borderRadius: 0,
					padding: "50px",
					border: "1px solid",
					borderColor: theme.palette.action.disabled,
				}}
			>
				{/* TITLE */}
				<Typography
					variant="h3"
					sx={{
						color: `${theme.palette.text.primary}`,
						marginBottom: "20px",
						maxWidth: "90vw",
						fontSize: { xs: "2rem", sm: "3rem" },
					}}
				>
					Create Account
				</Typography>

				<TextField
					label="Username"
					id="username"
					type="text"
					sx={{ width: "400px", maxWidth: "90vw" }}
					onChange={handleChangeUsername}
					value={username}
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
					onChange={handleChangePassword}
					value={password}
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
						onClick={() => navigate("/login")}
					>
						Login to existing account
					</Link>
					<Button variant="outlined" type="submit">
						Create
					</Button>
				</Box>
			</Paper>
		</Box>
	);
}

export default SignupPage;
