package api

import (
	"database/sql"
	"example/gossip/gossip-backend/models"
	"example/gossip/gossip-backend/utils"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func GetReplies(context *gin.Context, db *sql.DB) {

	id := context.Param("post_id")

	// standard query (multiple row)
	rows, err := db.Query(`
		SELECT 
			replies.id, replies.content, replies.user_id, 
			users.username, users.role, replies.post_id, replies.created_at 
		FROM 
			replies 
		JOIN
			users ON replies.user_id = users.id
		WHERE 
			post_id = $1`, id)

	if err != nil {
		// internal server error if cannot find
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve replies"})
		return
	}

	// closes rows before exiting this function
	defer rows.Close()

	replies := []models.Reply{}

	// loop through all rows
	for rows.Next() {
		var reply models.Reply
		var owner models.User
		// rows.scan inserts the values from rows into the addresses given
		err := rows.Scan(&reply.ID, &reply.Content, &owner.ID, &owner.Username, &owner.Role, &reply.PostID, &reply.CreatedAt)

		if err != nil {
			context.JSON(http.StatusInternalServerError, gin.H{"error": "Error while querying replies: " + err.Error()})
			return
		}

		reply.Owner = owner

		replies = append(replies, reply)

	}

	// return replies
	context.JSON(http.StatusOK, replies)
}

func CreateReply(context *gin.Context, db *sql.DB, requesterId int) {

	// Bind JSON request to new reply
	var newReply models.Reply

	if err := context.ShouldBindJSON(&newReply); err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": "Incorrect input format"})
		return
	}

	newReply.Content = strings.Trim(newReply.Content, " ")
	
	// Insert into the database
	var owner models.User
	err := db.QueryRow("INSERT INTO replies (content, post_id, user_id) VALUES ($1, $2, $3) RETURNING id, user_id", newReply.Content, newReply.PostID, requesterId).Scan(&newReply.ID, &owner.ID)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Error while creating reply: " + err.Error()})
		return
	}

	err = db.QueryRow("SELECT username, role FROM users WHERE id = $1", owner.ID).Scan(&owner.Username, &owner.Role)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Error while searching for user: " + err.Error()})
		return
	}

	newReply.Owner = owner
	
	context.JSON(http.StatusCreated, gin.H{"message":"Successfully created reply", "data":newReply})
}

func DeleteReply(context *gin.Context, db *sql.DB, requesterRole string, requesterId int) {
	// get id from url
	id := context.Param("id")

	var owner models.User
	var reply models.Reply

	// authentication
	err := db.QueryRow("SELECT id, content, post_id, user_id FROM replies WHERE id = $1", id).Scan(&reply.ID, &reply.Content, &reply.PostID, &owner.ID)
	if err == sql.ErrNoRows {
		context.JSON(http.StatusBadRequest, gin.H{"error": "That reply does not exist!"})
		return
	} else if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error":"Error while querying reply: " + err.Error()})
		return
	}

	if utils.RoleToPower(requesterRole) <= 1 && requesterId != owner.ID {
		context.JSON(http.StatusUnauthorized, gin.H{"error": "You do not have the authorization to delete that reply"})
		return
	}

	// execute delete
	result, err := db.Exec("DELETE FROM replies WHERE id = $1", id)

	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete reply"})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		// Item not found
		context.JSON(http.StatusNotFound, gin.H{"error": "Reply not found"})
		return
	}

	context.JSON(http.StatusOK, gin.H{"message": "Reply deleted", "data": reply})
}

func EditReply(context *gin.Context, db *sql.DB, requesterRole string, requesterId int) {
	id := context.Param("id")

	var updatedReply models.Reply

	// Bind the JSON to updatedReply
	if err := context.ShouldBindJSON(&updatedReply); err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": "Incorrect input format"})
		return
	}

	updatedReply.Content = strings.Trim(updatedReply.Content, " ")

	var owner models.User

	// authentication
	err := db.QueryRow("SELECT user_id FROM replies WHERE id = $1", id).Scan(&owner.ID)
	if err == sql.ErrNoRows {
		context.JSON(http.StatusBadRequest, gin.H{"error": "That reply does not exist!"})
		return
	} else if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error":"Error while querying reply: " + err.Error()})
		return
	}

	if utils.RoleToPower(requesterRole) <= 1 && requesterId != owner.ID {
		context.JSON(http.StatusUnauthorized, gin.H{"error": "You do not have the authorization to edit that reply"})
		return
	}
	
	err = db.QueryRow("UPDATE replies SET content = $1 WHERE id = $2 RETURNING id, post_id", updatedReply.Content, id).Scan(&updatedReply.ID, &updatedReply.PostID)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update reply"})
		return
	}

	context.JSON(http.StatusOK, gin.H{"message": "Successfully updated reply", "data": updatedReply})
}