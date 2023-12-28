import { ReactNode, useContext, useEffect } from "react";
import LoadingPage from "../../pages/LoadingPage";
import { AnimationContext } from "./AnimationWrapper";

interface ProtectedWrapperProps {
	children?: ReactNode;
	authenticated: boolean;
	redirect: string;
}
function ProtectedWrapper({
	children,
	authenticated,
	redirect,
}: ProtectedWrapperProps) {
	const navigate = useContext(AnimationContext)!;

	useEffect(() => {
		if (!authenticated) {
			navigate(redirect);
		}
	}, [authenticated, navigate, redirect]);

	if (!authenticated) return <LoadingPage />;

	return <>{children}</>;
}

export default ProtectedWrapper;
