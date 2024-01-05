package api

import (
	"example/gossip/gossip-backend/models"
	"example/gossip/gossip-backend/utils"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetReplies(context *gin.Context, db *gorm.DB) {

	id := context.Param("post_id")

	var replies []models.Reply
	if err := db.Preload("Owner").Where("post_id = ?", id).Find(&replies).Error; err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Error while retrieving replies: " + err.Error()})
		return
	}

	replyResponses := []models.ReplyResponse{}

	for _, reply := range replies {
		replyResponse := models.ReplyResponse {
			ID: reply.ID,
			CreatedAt: reply.CreatedAt,
			Content: reply.Content,
			PostID: reply.PostID,
			Owner: models.UserResponse {
				ID: reply.Owner.ID,
				Username: reply.Owner.Username,
				Role: reply.Owner.Role,
			},
		}
		replyResponses = append(replyResponses, replyResponse)
	}

	// return replies
	context.JSON(http.StatusOK, replyResponses)
}

func CreateReply(context *gin.Context, db *gorm.DB, requesterId uint) {

	// Bind JSON request to new reply
	var newReply models.Reply

	if err := context.ShouldBindJSON(&newReply); err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": "Incorrect input format"})
		return
	}

	newReply.Content = strings.Trim(newReply.Content, " ")
	newReply.UserID = requesterId

	if err := db.Create(&newReply).Error; err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Error while creating reply: " + err.Error()})
		return
	}
	
	context.JSON(http.StatusCreated, gin.H{"message":"Successfully created reply", "data": newReply})
}

func DeleteReply(context *gin.Context, db *gorm.DB, requesterRole string, requesterId uint) {
	// get id from url
	id := context.Param("id")

	// authentication
	var reply models.Reply
	if err := db.Preload("Owner").First(&reply, "\"id\" = ?", id).Error; err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if utils.RoleToPower(requesterRole) <= 0 && requesterId != reply.Owner.ID {
		context.JSON(http.StatusUnauthorized, gin.H{"error": "You do not have the authorization to delete that reply"})
		return
	}

	result := db.Where("\"id\" = ?", id).First(&reply)
	if err := result.Error; err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error":"Error while querying reply: " + err.Error()})
		return
	}
	if result.RowsAffected == 0 {
		context.JSON(http.StatusBadRequest, gin.H{"error": "That reply does not exist!"})
		return
	}

	if err := db.Where("\"id\" = ?", id).Delete(&reply).Error; err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error":"Error while deleting reply: " + err.Error()})
		return
	}

	context.JSON(http.StatusOK, gin.H{"message": "Reply deleted", "data": reply})
}

func EditReply(context *gin.Context, db *gorm.DB, requesterRole string, requesterId uint) {
	id := context.Param("id")
	
	var reply models.Reply
	if err := db.Preload("Owner").First(&reply, "\"id\" = ?", id).Error; err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if utils.RoleToPower(requesterRole) <= 0 && requesterId != reply.Owner.ID {
		context.JSON(http.StatusUnauthorized, gin.H{"error": "You do not have the authorization to edit that reply"})
		return
	}

	var updatedReply models.Reply

	// Bind the JSON to updatedReply
	if err := context.ShouldBindJSON(&updatedReply); err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": "Incorrect input format"})
		return
	}

	updatedReply.Content = strings.Trim(updatedReply.Content, " ")

	if err := db.Where("\"id\" = ?", id).Updates(&updatedReply).Error; err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Error while updating reply: " + err.Error()})
		return
	}

	context.JSON(http.StatusOK, gin.H{"message": "Successfully updated reply", "data": updatedReply})
}