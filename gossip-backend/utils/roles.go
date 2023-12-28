package utils

func RoleToPower(a string) int {
	if a == "superuser" {
		return 2
	} else if a == "admin" {
		return 1
	} else if a == "viewer" {
		return 0
	} else {
		return -1
	}
}