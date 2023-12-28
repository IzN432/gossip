package api

import (
	"database/sql"
	"example/gossip/gossip-backend/models"
	"example/gossip/gossip-backend/utils"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/lib/pq"
)

func GetTags(context *gin.Context, db *sql.DB) {

	// standard query (multiple row)
	rows, err := db.Query("SELECT id, description FROM tags")
	if err != nil {
		// internal server error if cannot find
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve tags"})
		return
	}

	// closes rows before exiting this function
	defer rows.Close()

	// this initializes to null slice
	tags := []models.Tag{}

	// loop through all rows
	for rows.Next() {
		var tag models.Tag

		// rows.scan inserts the values from rows into the addresses given
		err := rows.Scan(&tag.ID, &tag.Description)

		if err != nil {
			return
		}

		// go handles append to null slice for you so no need initialize
		tags = append(tags, tag)

	}

	// return tags
	context.JSON(http.StatusOK, tags)
}

func CreateTag(context *gin.Context, db *sql.DB) {

	// if (utils.RoleToPower(requesterRole) < 1) {
	// 	context.JSON(http.StatusUnauthorized, gin.H{"error":"You are unauthorized to create new tags"})
	// 	return
	// }

	// Bind JSON request to new tag
	var newTag models.Tag

	if err := context.ShouldBindJSON(&newTag); err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	newTag.Description = strings.Trim(newTag.Description, " ")
	
	// Insert into the database
	err := db.QueryRow("INSERT INTO tags (description) VALUES ($1) RETURNING id", newTag.Description).Scan(&newTag.ID)
	if err != nil {
		if err, ok := err.(*pq.Error); ok {
			if err.Code == "23505" {
				context.JSON(http.StatusBadRequest, gin.H{"error": "That tag already exists!"})
				return
			}
		}
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create tag"})
		return
	}

	context.JSON(http.StatusCreated, gin.H{"message": "Successfully created tag", "data": newTag})
}

func DeleteTag(context *gin.Context, db *sql.DB, requesterRole string) {

	if (utils.RoleToPower(requesterRole) < 1) {
		context.JSON(http.StatusUnauthorized, gin.H{"error":"You are unauthorized to create new tags"})
		return
	}

	// get id from url
	id := context.Param("id")

	result, err := db.Exec("DELETE FROM tags WHERE id = $1", id)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete tag"})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		// Item not found
		context.JSON(http.StatusNotFound, gin.H{"error": "Tag not found"})
		return
	}

	context.JSON(http.StatusOK, gin.H{"message": "Tag deleted"})
}