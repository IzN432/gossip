package api

import (
	"database/sql"
	"example/gossip/gossip-backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func LikePost(context *gin.Context, db *sql.DB, requesterId int) {
	id := context.Param("id")

	var like models.Like
	if err := context.ShouldBindJSON(&like); err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Error while parsing JSON: " + err.Error()})
		return
	}

	_, err := db.Exec("DELETE FROM likes WHERE post_id = ($1) AND user_id = ($2)", id, requesterId)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Error while deleting from database: " + err.Error()})
		return
	}

	var userID int
	err = db.QueryRow("SELECT u.id FROM users u INNER JOIN posts p ON p.user_id = u.id WHERE p.id = $1", id).Scan(&userID)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Error while checking database for self-likers: " + err.Error()})
		return
	}

	if userID == requesterId {
		context.JSON(http.StatusBadRequest, gin.H{"error": "No liking your own posts is allowed."})
		return
	}
	_, err = db.Exec("INSERT INTO likes (like_or_dislike, post_id, user_id) VALUES ($1, $2, $3)", like.LikeOrDislike, id, requesterId)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Error while inserting into database: " + err.Error()})
		return
	}

	var message string
	if like.LikeOrDislike {
		message = "liked"
	} else {
		message = "disliked"
	}
	context.JSON(http.StatusOK, gin.H{"message": "Successfully " + message + " the post"})
}

func UnlikePost(context *gin.Context, db *sql.DB, requesterId int) {
	id := context.Param("id")

	var like models.Like
	err := db.QueryRow("SELECT like_or_dislike FROM likes WHERE post_id = $1 AND user_id = $2", id, requesterId).Scan(&like.LikeOrDislike)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Error while querying database" + err.Error()})
		return
	}

	_, err = db.Exec("DELETE FROM likes WHERE post_id = $1 AND user_id = $2", id, requesterId)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Error while deleting from database" + err.Error()})
		return
	}

	var message string
	if like.LikeOrDislike {
		message = "unliked"
	} else {
		message = "undisliked"
	}

	context.JSON(http.StatusOK, gin.H{"message": "Successfully " + message + " the post"})
}

func GetLikes(context *gin.Context, db *sql.DB, requesterId int) {
	likes := []models.Like{}

	rows, err := db.Query("SELECT like_or_dislike, post_id, user_id FROM likes WHERE user_id = $1", requesterId)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Error while querying likes: " + err.Error()})
		return
	}
	for rows.Next() {
		var like models.Like
		err := rows.Scan(&like.LikeOrDislike, &like.PostID, &like.UserID)
		if err != nil {
			context.JSON(http.StatusInternalServerError, gin.H{"error": "Error while parsing likes: " + err.Error()})
			return
		}

		likes = append(likes, like)
	}

	context.JSON(http.StatusOK, likes)
}