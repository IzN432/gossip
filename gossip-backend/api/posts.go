package api

import (
	"database/sql"
	"example/gossip/gossip-backend/models"
	"example/gossip/gossip-backend/utils"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func GetPosts(context *gin.Context, db *sql.DB, requesterId int) {

	// standard query (multiple row)
	rows, err := db.Query(`
			SELECT 
				posts.id, posts.title, posts.content, posts.user_id,
				users.username, users.role, posts.created_at
			FROM
				posts
			JOIN
				users ON posts.user_id = users.id`)

	if err != nil {
		// internal server error if cannot find
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Error while retrieving posts: " + err.Error()})
		return
	}

	// closes rows before exiting this function
	defer rows.Close()

	// this initializes to null slice
	var posts []models.Post

	// loop through all rows
	for rows.Next() {
		var post models.Post

		// rows.scan inserts the values from rows into the addresses given
		var owner models.User
		
		err := rows.Scan(&post.ID, &post.Title, &post.Content, &owner.ID, &owner.Username, &owner.Role, &post.CreatedAt)
		if err != nil {
			context.JSON(http.StatusInternalServerError, gin.H{"error": "Error while retrieving posts: " + err.Error()})
			return
		}

		post.Owner = owner

		var like models.Like
		like.Interacted = true
		
		err = db.QueryRow("SELECT like_or_dislike, user_id, post_id FROM likes WHERE user_id = $1 AND post_id = $2", requesterId, post.ID).Scan(&like.LikeOrDislike, &like.UserID, &like.PostID)
		if err != sql.ErrNoRows && err != nil {
			context.JSON(http.StatusInternalServerError, gin.H{"error":"Error while retrieving like: " + err.Error()})
			return
		} else if err != sql.ErrNoRows {
			post.Like = like
		} 

		err = db.QueryRow("SELECT COUNT(*) FROM likes WHERE post_id = ($1) AND like_or_dislike = (true)", post.ID).Scan(&post.Likes)
		if err != nil {
			context.JSON(http.StatusInternalServerError, gin.H{"error":"Error while retrieving number of likes: " + err.Error()})
			return
		}

		err = db.QueryRow("SELECT COUNT(*) FROM likes WHERE post_id = ($1) AND like_or_dislike = (false)", post.ID).Scan(&post.Dislikes)
		if err != nil {
			context.JSON(http.StatusInternalServerError, gin.H{"error":"Error while retrieving number of dislikes: " + err.Error()})
			return
		}

		var tagCount int
		err1 := db.QueryRow(`SELECT COUNT(pt.tag_id) AS tag_count
							FROM posts p
							LEFT JOIN post_tag pt ON p.id = pt.post_id
							WHERE p.id = $1
							GROUP BY p.id`, post.ID).Scan(&tagCount)

		if err1 != nil {
			context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}

		if tagCount == 0 {
			post.Tags = []models.Tag{}
			posts = append(posts, post)
			continue
		}

		var tags []models.Tag
		tagRows, err := db.Query(`
			SELECT t.id as id, t.description as description
			FROM posts p
			LEFT JOIN post_tag pt ON p.id = pt.post_id
			LEFT JOIN tags t ON pt.tag_id = t.id
			WHERE p.id = $1
			ORDER BY t.id`, post.ID)

		if err != nil {
			context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve tags from posts"})
			return
		}

		for tagRows.Next() {
			var tag models.Tag
			err := tagRows.Scan(&tag.ID, &tag.Description)
			if err != nil {
				context.JSON(http.StatusInternalServerError, gin.H{"error": "Error when retrieving tags from posts"})
				return
			}
			
			tags = append(tags, tag)
		}

		post.Tags = tags

		
		// go handles append to null slice for you so no need initialize
		posts = append(posts, post)

	}

	// return posts
	context.JSON(http.StatusOK, posts)
}

func GetUserPosts(context *gin.Context, db *sql.DB) {

	// THIS FUNCTION MAY NOT FUNCTION PROPERLY
	id := context.Param("id")

	// standard query (multiple row)
	rows, err := db.Query(`
		SELECT 
			posts.id, posts.title, posts.content,
			posts.user_id, users.username, users.role, posts.created_at
		FROM
			posts
		JOIN
			users ON posts.user_id = users.id
		WHERE
    		posts.user_id = $1`, id)

	if err != nil {
		// internal server error if cannot find
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve posts"})
		return
	}

	// closes rows before exiting this function
	defer rows.Close()

	// this initializes to null slice
	var posts []models.Post

	// loop through all rows
	for rows.Next() {
		var post models.Post

		// rows.scan inserts the values from rows into the addresses given
		var owner models.User
		err := rows.Scan(&post.ID, &post.Title, &post.Content, &owner.ID, &owner.Username, &owner.Role, &post.CreatedAt)

		post.Owner = owner

		if err != nil {
			context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve posts"})
			return
		}

		var tagCount int
		err1 := db.QueryRow(`SELECT COUNT(pt.tag_id) AS tag_count
							FROM posts p
							LEFT JOIN post_tag pt ON p.id = pt.post_id
							WHERE p.id = $1
							GROUP BY p.id`, post.ID).Scan(&tagCount)

		if err1 != nil {
			context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}

		if tagCount == 0 {
			post.Tags = []models.Tag{}
			posts = append(posts, post)
			continue
		}

		var tags []models.Tag
		tagRows, err := db.Query(`
			SELECT t.id as id, t.description as description
			FROM posts p
			LEFT JOIN post_tag pt ON p.id = pt.post_id
			LEFT JOIN tags t ON pt.tag_id = t.id
			WHERE p.id = $1
			ORDER BY t.id`, post.ID)

		if err != nil {
			context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve tags from posts"})
			return
		}

		for tagRows.Next() {
			var tag models.Tag
			err := tagRows.Scan(&tag.ID, &tag.Description)
			if err != nil {
				context.JSON(http.StatusInternalServerError, gin.H{"error": "Error when retrieving tags from posts"})
				return
			}
			tags = append(tags, tag)
		}

		post.Tags = tags

		// go handles append to null slice for you so no need initialize
		posts = append(posts, post)

	}

	// return posts
	context.JSON(http.StatusOK, posts)
}

func GetPost(context *gin.Context, db *sql.DB, requesterId int) {
	// get the id from the url
	id := context.Param("id")

	row := db.QueryRow(`
		SELECT 
			posts.id, posts.title, posts.content,
			posts.user_id, users.username, users.role, posts.created_at
		FROM
			posts
		JOIN
			users ON posts.user_id = users.id
		WHERE
    		posts.id = $1`, id)

	var post models.Post
	var owner models.User

	err := row.Scan(&post.ID, &post.Title, &post.Content, &owner.ID, &owner.Username, &owner.Role, &post.CreatedAt)
	post.Owner = owner

	if err == sql.ErrNoRows {
		context.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	} else if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve post"})
		return
	}

	var like models.Like
	like.Interacted = true
	
	err = db.QueryRow("SELECT like_or_dislike, user_id, post_id FROM likes WHERE user_id = $1 AND post_id = $2", requesterId, post.ID).Scan(&like.LikeOrDislike, &like.UserID, &like.PostID)
	if err != sql.ErrNoRows && err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error":"Error while retrieving like: " + err.Error()})
		return
	} else if err != sql.ErrNoRows {
		post.Like = like
	} 
	
	err = db.QueryRow("SELECT COUNT(*) FROM likes WHERE post_id = ($1) AND like_or_dislike = (true)", post.ID).Scan(&post.Likes)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error":"Error while retrieving number of likes: " + err.Error()})
		return
	}

	err = db.QueryRow("SELECT COUNT(*) FROM likes WHERE post_id = ($1) AND like_or_dislike = (false)", post.ID).Scan(&post.Dislikes)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error":"Error while retrieving number of dislikes: " + err.Error()})
		return
	}

	// standard query (single row)
	tagRows, err := db.Query(`
		SELECT t.id as id, t.description as description
		FROM posts p
		INNER JOIN post_tag pt ON p.id = pt.post_id
		INNER JOIN tags t ON pt.tag_id = t.id
		WHERE p.id = $1
		ORDER BY t.id`, id)

	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Something went wrong while retrieving tags."})
		return
	}

	defer tagRows.Close()

	tags := []models.Tag{}

	for tagRows.Next() {
		var tag models.Tag
		if err := tagRows.Scan(&tag.ID, &tag.Description); err != nil {
			context.JSON(http.StatusInternalServerError, gin.H{"error": "Something went wrong while parsing tags."})
			return
		}

		tags = append(tags, tag)
	}

	replyRows, err := db.Query(`
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
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Something went wrong while retrieving replies."})
		return
	}

	defer replyRows.Close()

	replies := []models.Reply{}

	for replyRows.Next() {
		var reply models.Reply
		var owner models.User
		if err := replyRows.Scan(&reply.ID, &reply.Content, &owner.ID, &owner.Username, &owner.Role, &reply.PostID, &reply.CreatedAt); err != nil {
			context.JSON(http.StatusInternalServerError, gin.H{"error": "Something went wrong while parsing replies."})
			return
		}

		reply.Owner = owner

		replies = append(replies, reply)
	}

	post.Tags = tags
	post.Replies = replies

	context.JSON(http.StatusOK, post)
}

func CreatePost(context *gin.Context, db *sql.DB, requesterId int) {
	// Bind JSON request to new post
	var newPost models.Post

	if err := context.ShouldBindJSON(&newPost); err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": "Incorrect input format"})
		return
	}
	
	newPost.Title = strings.Trim(newPost.Title, " ")
	newPost.Content = strings.Trim(newPost.Content, " ")
	
	exists, err1 := utils.TagsExist(newPost.Tags, db)

	if err1 != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": err1.Error()})
		return
	}

	if !exists {
		context.JSON(http.StatusBadRequest, gin.H{"error": "Tag does not exist in database"})
		return
	}

	// Insert into the database
	var owner models.User
	err := db.QueryRow("INSERT INTO posts (title, content, user_id) VALUES ($1, $2, $3) RETURNING id, user_id", newPost.Title, newPost.Content, requesterId).Scan(&newPost.ID, &owner.ID)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Error while creating post: " + err.Error()})
		return
	}

	err = db.QueryRow("SELECT username, role FROM users WHERE id = $1", owner.ID).Scan(&owner.Username, &owner.Role)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Error while querying username: " + err.Error()})
		return
	}

	newPost.Owner = owner

	// Create post tag relationships
	for _, tag := range newPost.Tags {
		if _, err := db.Exec("INSERT INTO post_tag (post_id, tag_id) VALUES ($1, $2)", newPost.ID, tag.ID); err != nil {
			context.JSON(http.StatusInternalServerError, gin.H{"error": "Error while adding post tag relationship: " + err.Error()})
			return
		}
	}

	replies := []models.Reply{}
	newPost.Replies = replies

	context.JSON(http.StatusCreated, gin.H{"message":"Successfully created new post!", "data": newPost})
}

func DeletePost(context *gin.Context, db *sql.DB, requesterRole string, requesterId int) {

	// get id from url
	id := context.Param("id")

	var owner models.User

	err := db.QueryRow("SELECT user_id FROM posts WHERE id = $1", id).Scan(&owner.ID)
	if (err != nil) {
		context.JSON(http.StatusInternalServerError, gin.H{"error":"Error while querying post: " + err.Error()})
		return
	}

	if (utils.RoleToPower(requesterRole) <= 0 && owner.ID != requesterId) {
		context.JSON(http.StatusUnauthorized, gin.H{"error":"You are not authorized to delete that post"})
		return
	}

	result, err := db.Exec("DELETE FROM posts WHERE id = $1", id)

	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete post"})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		// Item not found
		context.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}

	context.JSON(http.StatusOK, gin.H{"message": "Post deleted"})
}

func UpdatePost(context *gin.Context, db *sql.DB, requesterRole string, requesterId int) {
	id := context.Param("id")

	var updatedPost models.Post
	var owner models.User

	// authentication
	err := db.QueryRow("SELECT user_id FROM posts WHERE id = $1", id).Scan(&owner.ID)
	if (err != nil) {
		context.JSON(http.StatusInternalServerError, gin.H{"error":"Error while querying post: " + err.Error()})
		return
	}

	if (utils.RoleToPower(requesterRole) <= 0 && owner.ID != requesterId) {
		context.JSON(http.StatusUnauthorized, gin.H{"error":"You are not authorized to edit that post"})
		return
	}

	// Bind the JSON to updatedPost
	if err := context.ShouldBindJSON(&updatedPost); err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": "Incorrect input format"})
		return
	}

	updatedPost.Title = strings.Trim(updatedPost.Title, " ")
	updatedPost.Content = strings.Trim(updatedPost.Content, " ")

	// check if the tags all exist
	exists, err1 := utils.TagsExist(updatedPost.Tags, db)

	if err1 != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": err1.Error()})
		return
	}

	if !exists {
		context.JSON(http.StatusBadRequest, gin.H{"error": "Tag does not exist in database"})
		return
	}

	// execute the update
	_, err = db.Exec("UPDATE posts SET title = $1, content = $2 WHERE id = $3", updatedPost.Title, updatedPost.Content, id)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Error while updating post: " + err.Error()})
		return
	}

	// Update post tag relationship
	// First delete all tags associated with the post
	_, err = db.Exec("DELETE FROM post_tag WHERE post_id = $1", id)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Error while clearing tags: " + err.Error()})
		return
	}
	for _, tag := range updatedPost.Tags {
		if _, err := db.Exec("INSERT INTO post_tag (post_id, tag_id) VALUES ($1, $2)", id, tag.ID); err != nil {
			context.JSON(http.StatusInternalServerError, gin.H{"error": "Error while updating post-tag relationship: " + err.Error()})
			return
		}
	}

	context.JSON(http.StatusOK, gin.H{"message": "Post updated successfully"})
}

