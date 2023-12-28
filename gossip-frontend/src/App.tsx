import { Box, ThemeProvider, createTheme, useMediaQuery } from "@mui/material";
import CreatePost from "./pages/CreatePost";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ViewPost from "./pages/ViewPost";
import EditPost from "./pages/EditPost";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import SigninPage from "./pages/SigninPage";
import { createContext, useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { getToken } from "./utils/auth";
import SignupPage from "./pages/SignupPage";
import Wrapper from "./components/Wrappers/AnimationWrapper";
import ProtectedWrapper from "./components/Wrappers/ProtectedWrapper";
import { resetApiState } from "./redux/api";
import LoadingPage from "./pages/LoadingPage";

export const AuthContext = createContext(false);

function App() {
	const mode: string = "dark";

	const theme = createTheme({
		palette: {
			...(mode === "dark"
				? { mode: mode }
				: { background: { default: "lightgray" } }),
		},
		components: {
			MuiUseMediaQuery: {
				defaultProps: {
					noSsr: true,
				},
			},
		},
		breakpoints: {
			values: {
				xs: 0,
				sm: 600,
				md: 600,
				lg: 1000,
				xl: 1536,
			},
		},
	});

	const [isAuthenticated, setAuthenticated] = useState(() => {
		const token = getToken();
		return token !== null;
	});

	const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

	useEffect(() => {
		const handleStorageChange = () => {
			const token = getToken();
			setAuthenticated(!!token);

			// clear cache on login
			if (!!token) store.dispatch(resetApiState());
		};

		// Attach event listener for changes in localStorage
		window.addEventListener("storage", handleStorageChange);

		// Cleanup the event listener when the component is unmounted
		return () => {
			window.removeEventListener("storage", handleStorageChange);
		};
	}, []);

	return (
		<ThemeProvider theme={theme}>
			<Provider store={store}>
				<Toaster
					toastOptions={{ duration: 2000 }}
					position={isSmall ? "bottom-center" : "top-center"}
				/>
				<AuthContext.Provider value={isAuthenticated}>
					<Box
						sx={{
							height: "100vh",
							backgroundColor: theme.palette.background.default,
						}}
					>
						<BrowserRouter>
							<Routes>
								<Route path="/loading" element={<LoadingPage />} />
								<Route
									path="/"
									element={
										<Wrapper direction="down">
											<ProtectedWrapper
												redirect="/login"
												authenticated={isAuthenticated}
											>
												<Home />
											</ProtectedWrapper>
										</Wrapper>
									}
								/>
								<Route
									path="/create"
									element={
										<Wrapper direction="down">
											<ProtectedWrapper
												redirect="/login"
												authenticated={isAuthenticated}
											>
												<CreatePost />
											</ProtectedWrapper>
										</Wrapper>
									}
								/>
								<Route
									path="/view/:id"
									element={
										<Wrapper direction="down">
											<ProtectedWrapper
												redirect="/login"
												authenticated={isAuthenticated}
											>
												<ViewPost />
											</ProtectedWrapper>
										</Wrapper>
									}
								/>
								<Route
									path="/edit/:id"
									element={
										<Wrapper direction="down">
											<ProtectedWrapper
												redirect="/login"
												authenticated={isAuthenticated}
											>
												<EditPost />
											</ProtectedWrapper>
										</Wrapper>
									}
								/>
								<Route
									path="/login"
									element={
										<Wrapper direction="down">
											<ProtectedWrapper
												redirect="/"
												authenticated={!isAuthenticated}
											>
												<SigninPage />
											</ProtectedWrapper>
										</Wrapper>
									}
								/>
								<Route
									path="/signup"
									element={
										<Wrapper direction="down">
											<ProtectedWrapper
												redirect="/"
												authenticated={!isAuthenticated}
											>
												<SignupPage />
											</ProtectedWrapper>
										</Wrapper>
									}
								/>
							</Routes>
						</BrowserRouter>
					</Box>
				</AuthContext.Provider>
			</Provider>
		</ThemeProvider>
	);
}

export default App;
