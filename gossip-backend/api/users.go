package api

import (
	"database/sql"
	"example/gossip/gossip-backend/models"
	"example/gossip/gossip-backend/utils"
	"net/http"
	"regexp"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

func SigninUser(context *gin.Context, db *sql.DB) {
	
	var signinUser models.User
	var databaseUser models.User

	if err := context.ShouldBindJSON(&signinUser); err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Error while parsing JSON: " + err.Error()})
		return
	}

	err := db.QueryRow("SELECT id, role, password FROM users WHERE UPPER(username) LIKE UPPER($1)", signinUser.Username).Scan(&databaseUser.ID, &databaseUser.Role, &databaseUser.Password)
	if err == sql.ErrNoRows {
		context.JSON(http.StatusUnauthorized, gin.H{"error":"Username not found"})
		return
	} else if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error":"Error while searching for user: " + err.Error()})
		return
	}

	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error":"Error while hashing password: " + err.Error()})
	}

	err = bcrypt.CompareHashAndPassword([]byte(databaseUser.Password), []byte(signinUser.Password))
	if err != nil {
		context.JSON(http.StatusUnauthorized, gin.H{"error": "Incorrect password: " + err.Error()})
		return
	}

	token, err := utils.GenerateToken(databaseUser.ID, databaseUser.Role)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Error while generating JWT Token: " + err.Error()})
		return
	}

	var returnUser models.User
	returnUser.ID = databaseUser.ID
	returnUser.Username = signinUser.Username
	returnUser.Role = databaseUser.Role

	payload := gin.H{ "user": returnUser, "token": token }
	context.JSON(http.StatusOK, gin.H{"message": "Successfully signed in", "data": payload})
}

func CreateUser(context *gin.Context, db *sql.DB, requesterRole string) {
	// Bind JSON request to new tag
	var newUser models.User

	if err := context.ShouldBindJSON(&newUser); err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": "Error while parsing JSON: " + err.Error()})
		return
	}

	if strings.Contains(newUser.Password, " ") {
		context.JSON(http.StatusBadRequest, gin.H{"error": "Password cannot contain spaces!"})
		return
	}

	matched, err := regexp.Match(`^[a-zA-Z0-9_.-]+$`, []byte(newUser.Username))
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Error while validating username: " + err.Error()})
		return
	}

	if !matched {
		context.JSON(http.StatusBadRequest, gin.H{"error": "Username cannot contain special characters or spaces!"})
		return
	}

	matched, err = regexp.Match(`^[a-zA-Z].*$`, []byte(newUser.Username))
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Error while validating username: " + err.Error()})
		return
	}

	if !matched {
		context.JSON(http.StatusBadRequest, gin.H{"error": "Username must begin with a letter!"})
		return
	}

	if utils.RoleToPower(newUser.Role) >= 1 && utils.RoleToPower(requesterRole) <= utils.RoleToPower(newUser.Role) {
		context.JSON(http.StatusUnauthorized, gin.H{"error": "You are not authorized to create a User with that role"})
		return
	}

	// Check that username is unique
	var count int
	err = db.QueryRow("SELECT COUNT(*) FROM users WHERE UPPER(username) LIKE UPPER($1)", newUser.Username).Scan(&count)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error":"Error while checking for username availability: " + err.Error()})
		return
	}
	if count != 0 {
		context.JSON(http.StatusUnprocessableEntity, gin.H{"error": "Username is already in use"})
		return
	}

	// Insert into the database
	hashedPassword, err := utils.HashPassword(newUser.Password)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Error while hashing password: " + err.Error()})
		return
	}

	err = db.QueryRow("INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id", newUser.Username, hashedPassword, newUser.Role).Scan(&newUser.ID)
	if err, ok := err.(*pq.Error); ok {
		if err.Constraint == "user_check_min_length_username" {
			context.JSON(http.StatusBadRequest, gin.H{"error": "Username should be at least 4 characters long!"})
			return
		}
	}
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Error while creating user: " + err.Error()})
		return
	}

	token, err := utils.GenerateToken(newUser.ID, newUser.Role)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Error while generating JWT Token: " + err.Error()})
		return
	}

	context.JSON(http.StatusCreated, gin.H{"message": "Successfully created a new user", "data": gin.H{"token": token, "user": newUser}})
}

func DeleteUser(context *gin.Context, db *sql.DB, requesterRole string, requesterId int) {

	// get id from url
	id := context.Param("id")

	// authentication
	var user models.User
	err := db.QueryRow("SELECT id, username, password, role FROM users WHERE id = $1", id).Scan(&user.ID, &user.Username, &user.Password, &user.Role)

	if utils.RoleToPower(user.Role) >= utils.RoleToPower(requesterRole) && requesterId != user.ID {
		context.JSON(http.StatusUnauthorized, gin.H{"error": "You do not have the authorization to delete that user"})
		return
	}

	result, err := db.Exec("DELETE FROM users WHERE id = $1", id)

	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		context.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	context.JSON(http.StatusOK, gin.H{"message": "User deleted"})
}