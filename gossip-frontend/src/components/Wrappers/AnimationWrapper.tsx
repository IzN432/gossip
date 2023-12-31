import { Slide } from "@mui/material";
import { createContext, useEffect, useState } from "react";
import { To, useNavigate } from "react-router-dom";

export const AnimationContext = createContext<
	((path: To | number) => void) | null
>(null);

interface AnimationWrapperProps {
	children?: React.ReactNode;
	direction?: "up" | "down" | "left" | "right";
}

function AnimationWrapper({ children, direction }: AnimationWrapperProps) {
	const navigate = useNavigate();

	const [isIn, setIsIn] = useState(true);

	const timeout = 500;

	const customNavigate = (path: To | number) => {
		setIsIn(false);
		setTimeout(() => {
			if (typeof path === "number") navigate(path);
			else navigate(path);
		}, timeout);
	};

	useEffect(() => {
		setIsIn(true);
	}, [navigate]);

	return (
		<AnimationContext.Provider value={customNavigate}>
			<Slide
				style={{ height: "100%" }}
				in={isIn}
				appear
				timeout={timeout}
				easing={"cubic-bezier(0,.55,.17,1.16)"}
				direction={direction || "down"}
			>
				<div>{children}</div>
			</Slide>
		</AnimationContext.Provider>
	);
}

export default AnimationWrapper;
