import NavigateButton from "./Buttons/NavigateButton";
import ProfileButton from "./Buttons/ProfileButton";

interface NavigateButtonsProps {
	isHomeButton: boolean;
}
function NavigateButtons({ isHomeButton }: NavigateButtonsProps) {
	return (
		<>
			<NavigateButton
				isHomeButton={isHomeButton}
				sx={{
					top: { xs: "5px", sm: "20px" },
					left: { xs: "5px", sm: "20px" },
				}}
			/>

			{/* Profile Button */}
			<ProfileButton
				sx={{
					top: { xs: "5px", sm: "20px" },
					right: { xs: "5px", sm: "20px" },
				}}
			/>
		</>
	);
}

export default NavigateButtons;
