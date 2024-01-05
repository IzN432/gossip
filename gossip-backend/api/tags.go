package api

import (
	"example/gossip/gossip-backend/models"
	"example/gossip/gossip-backend/utils"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetTags(context *gin.Context, db *gorm.DB) {
	var tags []models.Tag
	if err := db.Find(&tags).Error; err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Error while retrieving tags: " + err.Error()})
		return
	}

	responseTags := []models.TagResponse{}
	for _, tag := range tags {
		responseTag := models.TagResponse {
			ID: tag.ID,
			Description: tag.Description,
		}
		responseTags = append(responseTags, responseTag)
	}
	// return tags
	context.JSON(http.StatusOK, responseTags)
}

func CreateTag(context *gin.Context, db *gorm.DB) {

	// Bind JSON request to new tag
	var newTag models.Tag

	if err := context.ShouldBindJSON(&newTag); err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": "Incorrect input format"})
		return
	}
	newTag.Description = strings.Trim(newTag.Description, " ")
	
	if err := db.Create(&newTag).Error; err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Error while creating tags: " + err.Error()})
		return
	}

	responseTag := models.TagResponse {
		ID: newTag.ID,
		Description: newTag.Description,
	}

	context.JSON(http.StatusCreated, gin.H{"message": "Successfully created tag", "data": responseTag})
}

func DeleteTag(context *gin.Context, db *gorm.DB, requesterRole string) {

	if (utils.RoleToPower(requesterRole) <= 0) {
		context.JSON(http.StatusUnauthorized, gin.H{"error":"You are unauthorized to create new tags"})
		return
	}

	// get id from url
	id := context.Param("id")

	if err := db.Where("\"id\" = ?", id).Delete(&models.Tag{}).Error; err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Error while deleting tag: " + err.Error()})
		return
	}

	context.JSON(http.StatusOK, gin.H{"message": "Tag deleted"})
}