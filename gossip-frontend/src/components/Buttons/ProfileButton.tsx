import { Box, Tooltip, Avatar, SxProps, Menu, MenuItem } from "@mui/material";
import { logout } from "../../utils/auth";
import { useState } from "react";

interface ProfileButtonProps {
	sx?: SxProps;
}
function ProfileButton({ sx }: ProfileButtonProps) {
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const open = Boolean(anchorEl);

	const handleClick = (e: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(e.currentTarget);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};

	return (
		<Box
			sx={{
				position: "absolute",
				top: "20px",
				right: "30px",
				display: "flex",
				gap: "20px",
				alignItems: "center",
				zIndex: "1",
				":hover": {
					cursor: "pointer",
				},
				...sx,
			}}
		>
			<Tooltip title="Account" onClick={handleClick}>
				<Avatar sx={{ width: "48px", height: "48px" }} />
			</Tooltip>
			<Menu
				id="basic-menu"
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
				MenuListProps={{
					"aria-labelledby": "basic-button",
				}}
				transformOrigin={{ vertical: -10, horizontal: 0 }}
			>
				<MenuItem
					onClick={() => {
						logout();
						handleClose();
					}}
				>
					Logout
				</MenuItem>
			</Menu>
		</Box>
	);
}

export default ProfileButton;
