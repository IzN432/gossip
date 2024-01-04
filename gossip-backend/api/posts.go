package api

import (
	"example/gossip/gossip-backend/models"
	"example/gossip/gossip-backend/utils"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetPosts(context *gin.Context, db *gorm.DB, requesterId uint) {

	// get all posts with user object and tags and the like object that is linked to requesterId
	var posts []models.Post
	
	if err := db.Preload("Owner").
				Preload("Tags").
				Preload("Likes").
				Joins("left join \"likes\" ON \"likes\".user_id = ?", requesterId).
				Find(&posts).Error; err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Error while retrieving posts: " + err.Error()})
		return
	}

	responsePosts := []models.PostResponse{}
	for _, post := range posts {
		var numLikes int64

		db.Model(&models.Like{}).Where("post_id = ? AND \"like\" = ?", post.ID, true).Count(&numLikes)

		var responseLike models.LikeResponse
		if (len(post.Likes) > 0) {
			responseLike.Like = post.Likes[0].Like
			responseLike.Dislike= post.Likes[0].Dislike
		}

		responseTags := []models.TagResponse{}
		for _, tag := range post.Tags {
			responseTag := models.TagResponse {
				ID:	tag.ID,
				Description: tag.Description,
			}
			responseTags = append(responseTags, responseTag)
		}

		responsePost := models.PostResponse{
			ID: post.ID,
			CreatedAt: post.CreatedAt,
			Title: post.Title,
			Content: post.Content,
			Owner: models.UserResponse{
				ID: post.Owner.ID,
				Username: post.Owner.Username,
				Role: post.Owner.Role,
			},
			Tags: responseTags,
			Likes: numLikes,
			Like: responseLike,
		}

		responsePosts = append(responsePosts, responsePost)
	}

	context.JSON(http.StatusOK, responsePosts)
}

func GetPost(context *gin.Context, db *gorm.DB, requesterId uint) {
	// get the id from the url
	id := context.Param("id")

	var post models.Post
	if err := db.Preload("Owner").Preload("Tags").Preload("Likes").Joins("left join \"likes\" ON \"likes\".\"user_id\" = ?", requesterId).First(&post, "\"posts\".\"id\" = ?", id).Error; err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Error while retrieving posts: " + err.Error()})
		return
	}

	var numLikes int64
	var numDislikes int64

	db.Model(&models.Like{}).Where("post_id = ? AND \"like\" = ?", post.ID, true).Count(&numLikes)
	db.Model(&models.Like{}).Where("post_id = ? AND dislike = ?", post.ID, true).Count(&numDislikes)

	var responseLike models.LikeResponse
	if (len(post.Likes) > 0) {
		responseLike.Like = post.Likes[0].Like
		responseLike.Dislike= post.Likes[0].Dislike
	}

	responseTags := []models.TagResponse{}
	for _, tag := range post.Tags {
		responseTag := models.TagResponse {
			ID:	tag.ID,
			Description: tag.Description,
		}
		responseTags = append(responseTags, responseTag)
	}

	responsePost := models.PostResponse{
		ID: post.ID,
		CreatedAt: post.CreatedAt,
		Title: post.Title,
		Content: post.Content,
		Owner: models.UserResponse{
			ID: post.Owner.ID,
			Username: post.Owner.Username,
			Role: post.Owner.Role,
		},
		Tags: responseTags,
		Likes: numLikes,
		Dislikes: numDislikes,
		Like: responseLike,
	}

	context.JSON(http.StatusOK, responsePost)
}

func CreatePost(context *gin.Context, db *gorm.DB, requesterId uint) {
	// Bind JSON request to new post
	type requestParams struct {
		Title		string			`json:"title"`
		Content		string			`json:"content"`
		Tags		[]*models.Tag	`json:"tags"`
		OwnerID		uint
	}

	var owner models.User
	if err := db.First(&owner, "id = ?", requesterId).Error; err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var postForm requestParams
	if err := context.ShouldBindJSON(&postForm); err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": "Incorrect input format"})
		return
	}
	
	postForm.Title = strings.Trim(postForm.Title, " ")
	postForm.Content = strings.Trim(postForm.Content, " ")
	
	exists, err := utils.TagsExist(postForm.Tags, db)

	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Error while searching for tags: " + err.Error()})
		return
	}

	if !exists {
		context.JSON(http.StatusBadRequest, gin.H{"error": "Tag does not exist in database"})
		return
	}

	var post models.Post
	post.Title = postForm.Title
	post.Content = postForm.Content
	post.OwnerID = requesterId
	
	// Assuming Tag is your model representing a tag
	tags := []*models.Tag{}
	for _, tag := range postForm.Tags {
		var t models.Tag
		// Assuming FindTagById is a function that finds a tag by its ID
		if err := db.First(&t, tag.ID).Error; err != nil {
			context.JSON(http.StatusInternalServerError, gin.H{"error": "Error while fetching tag: " + err.Error()})
			return
		}
		tags = append(tags, &t)
	}

	post.Tags = tags

	request := db.Create(&post)
	if err := request.Error; err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	context.JSON(http.StatusCreated, gin.H{"message":"Successfully created new post!"})
}

func UpdatePost(context *gin.Context, db *gorm.DB, requesterRole string, requesterId uint) {
	id := context.Param("id")

	// authentication
	var post models.Post
	if err := db.Preload("Owner").First(&post, "id = ?", id).Error; err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return

	}

	if (utils.RoleToPower(requesterRole) <= 0 && post.Owner.ID != requesterId) {
		context.JSON(http.StatusUnauthorized, gin.H{"error":"You are not authorized to edit that post"})
		return
	}

	type requestParams struct {
		ID			uint
		Title		string
		Content		string
		Tags		[]*models.Tag
	}

	// Bind the JSON to updatedPost
	var postForm requestParams
	if err := context.ShouldBindJSON(&postForm); err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": "Incorrect input format"})
		return
	}

	postForm.Title = strings.Trim(postForm.Title, " ")
	postForm.Content = strings.Trim(postForm.Content, " ")

	// check if the tags all exist
	exists, err := utils.TagsExist(postForm.Tags, db)

	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if !exists {
		context.JSON(http.StatusBadRequest, gin.H{"error": "Tag does not exist in database"})
		return
	}

	tags := []*models.Tag{}
	for _, tag := range postForm.Tags {
		var t models.Tag
		// Assuming FindTagById is a function that finds a tag by its ID
		if err := db.First(&t, tag.ID).Error; err != nil {
			context.JSON(http.StatusInternalServerError, gin.H{"error": "Error while fetching tag: " + err.Error()})
			return
		}
		tags = append(tags, &t)
	}

	// execute the update
	if err := db.Exec("DELETE FROM post_tag WHERE post_id = ?", id).Error; err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Error while deleting tags: " + err.Error()})
		return
	}
	if err := db.Model(&models.Post{ID: post.ID}).Where("id = ?", id).Update("Tags", tags).Update("Title", postForm.Title).Update("Content", postForm.Content).Error; err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Error while updating: " + err.Error()})
		return
	}

	context.JSON(http.StatusOK, gin.H{"message": "Post updated successfully"})
}

func DeletePost(context *gin.Context, db *gorm.DB, requesterRole string, requesterId uint) {
	id := context.Param("id")

	var post models.Post
	if err := db.Preload("Owner").First(&post, "id = ?", id).Error; err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if (utils.RoleToPower(requesterRole) <= 0 && post.Owner.ID != requesterId) {
		context.JSON(http.StatusUnauthorized, gin.H{"error":"You are not authorized to delete that post"})
		return
	}

	// DELETE ALL REPLIES
	if err := db.Where("post_id = ?", id).Delete(&models.Reply{}).Error; err != nil {
		context.JSON(http.StatusUnauthorized, gin.H{"error":"Error while deleting replies: " + err.Error()})
		return
	}

	// DELETE ALL TAGS
	result := db.Where("id = ?", id).Select("Tags", "Likes", "Replies").Delete(&models.Post{ID: post.ID})
	
	if result.Error != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Error while deleting: " + result.Error.Error()})
		return
	}

	if result.RowsAffected == 0 {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Post not found!"})
		return
	}

	context.JSON(http.StatusOK, gin.H{"message": "Post deleted"})
}
