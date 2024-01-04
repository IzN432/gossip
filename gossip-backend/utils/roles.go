package utils

func RoleToPower(a string) int {
	switch a {
	case "superuser":
		return 2
	case "admin":
		return 1
	case "viewer":
		return 0
	default:
		return -1
	}
}