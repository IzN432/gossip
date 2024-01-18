package api

import (
	"example/gossip/gossip-backend/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func CreateLike(context *gin.Context, db *gorm.DB, requesterId uint) {

	param, err := strconv.ParseUint(context.Param("id"), 10, 0)
	if err != nil || param > uint64(^uint(0)) {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Error while parsing PostID: " + err.Error()})
		return
	}

	postId := uint(param)

	// retrieve the json and put it into a struct
	type requestParams struct {
		Like    bool `json:"isLiked"`
		Dislike bool `json:"isDisliked"`
	}

	var likeForm requestParams
	if err := context.ShouldBindJSON(&likeForm); err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Error while parsing JSON: " + err.Error()})
		return
	}

	// Check for self likers
	var post models.Post
	if err := db.First(&post, postId).Error; err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Error while querying database: " + err.Error()})
		return
	}

	if post.OwnerID == requesterId {
		context.JSON(http.StatusBadRequest, gin.H{"error": "No liking your own posts is allowed."})
		return
	}

	// Insert the like
	var like models.Like
	result := db.FirstOrCreate(&like, models.Like{PostID: postId, UserID: requesterId})
	if result.Error != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Error while querying database: " + result.Error.Error()})
		return
	}

	if likeForm.Like == likeForm.Dislike && likeForm.Like {
		context.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request structure"})
		return
	}

	if err := db.Model(&like).Where("\"user_id\" = ? AND \"post_id\" = ?", requesterId, postId).
		Update("Like", likeForm.Like).
		Update("Dislike", likeForm.Dislike).Error; err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Error while updating like: " + err.Error()})
		return
	}

	var message string
	if likeForm.Like {
		message = "liked the post"
	} else if likeForm.Dislike {
		message = "disliked the post"
	} else {
		message = "unreacted to the post"
	}

	context.JSON(http.StatusOK, gin.H{"message": "Successfully " + message})
}
