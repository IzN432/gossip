package api

import (
	"errors"
	"example/gossip/gossip-backend/models"
	"example/gossip/gossip-backend/utils"
	"net/http"
	"regexp"
	"strings"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func SigninUser(context *gin.Context, db *gorm.DB) {

	var signinUser models.User
	var databaseUser models.User

	if err := context.ShouldBindJSON(&signinUser); err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Error while parsing JSON: " + err.Error()})
		return
	}

	err := db.Where("UPPER(username) LIKE UPPER(?)", signinUser.Username).First(&databaseUser).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		context.JSON(http.StatusUnauthorized, gin.H{"error":"Username not found"})
		return
	} else if (err != nil) {
		context.JSON(http.StatusInternalServerError, gin.H{"error":"Error while querying database: " + err.Error()})
	}

	err = bcrypt.CompareHashAndPassword([]byte(databaseUser.Password), []byte(signinUser.Password))
	if err != nil {
		context.JSON(http.StatusUnauthorized, gin.H{"error": "Incorrect password"})
		return
	}

	token, err := utils.GenerateToken(databaseUser.ID, databaseUser.Role)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Error while generating JWT Token: " + err.Error()})
		return
	}

	type responseParams struct {
		ID			uint		`json:"id"`
		Username	string		`json:"username"`
		Role		string		`json:"role"`
	}

	var returnUser responseParams
	returnUser.ID = databaseUser.ID
	returnUser.Username = signinUser.Username
	returnUser.Role = databaseUser.Role

	payload := gin.H{ "user": returnUser, "token": token }
	context.JSON(http.StatusOK, gin.H{"message": "Successfully signed in", "data": payload})
}

func CreateUser(context *gin.Context, db *gorm.DB, requesterRole string) {
	
	// Bind JSON request to new tag
	var newUser models.User

	if err := context.ShouldBindJSON(&newUser); err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": "Incorrect format"})
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
	var count int64
	if err := db.Model(&models.User{}).Where("UPPER(username) LIKE UPPER(?)", newUser.Username).Count(&count).Error; err != nil {
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

	newUser.Password = hashedPassword

	if err := db.Create(&newUser).Error; err != nil {
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

func GetUser(context *gin.Context, db *gorm.DB, requesterId uint) {
	var user models.User
	if err := db.First(&user, requesterId).Error; err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Error while accessing user: " + err.Error()})
		return
	}

	responseUser := models.UserResponse{ ID: user.ID, Username: user.Username, Role: user.Role }

	context.JSON(http.StatusOK, responseUser)
}

// func DeleteUser(context *gin.Context, db *gorm.DB, requesterRole string, requesterId int) {

// 	// get id from url
// 	id := context.Param("id")

// 	// authentication
// 	var user models.User
// 	err := db.QueryRow("SELECT id, username, password, role FROM users WHERE id = ?", id).Scan(&user.ID, &user.Username, &user.Password, &user.Role)

// 	if utils.RoleToPower(user.Role) >= utils.RoleToPower(requesterRole) && requesterId != user.ID {
// 		context.JSON(http.StatusUnauthorized, gin.H{"error": "You do not have the authorization to delete that user"})
// 		return
// 	}

// 	result, err := db.Exec("DELETE FROM users WHERE id = ?", id)

// 	if err != nil {
// 		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
// 		return
// 	}

// 	rowsAffected, _ := result.RowsAffected()
// 	if rowsAffected == 0 {
// 		context.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
// 		return
// 	}

// 	context.JSON(http.StatusOK, gin.H{"message": "User deleted"})
// }