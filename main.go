package main

import (
	"example/gossip/gossip-backend/api"
	"example/gossip/gossip-backend/utils"
	"flag"
	"fmt"
	"net/http"
	"os"

	"database/sql"
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

// address of db is stored
var db *sql.DB

func main() {
	
	// Define a flag named "mode" with a default value of "production"
	modePtr := flag.String("mode", "production", "Set the mode of the application (development/production)")

	// Parse the command-line arguments
	flag.Parse()

	// Access the value of the "mode" flag
	mode := *modePtr
	
	if (mode != "production") {
		if err := godotenv.Load(); err != nil {
			log.Fatal("Error loading .env file")
		}
	} 

	if (mode == "production") {
		// Set to release mode
		gin.SetMode(gin.ReleaseMode)
	} 

	// connect to the database
	connect := fmt.Sprintf("host=%s user=%s password=%s dbname=gossip port=5432 sslmode=%s",
						os.Getenv("DB_HOST"), os.Getenv("DB_USERNAME"), os.Getenv("DB_PASSWORD"), os.Getenv("DB_SSLMODE"))
	var err error
	db, err = sql.Open("postgres", connect)
	
	// checks for error
	if err != nil {
		log.Fatal(err)
		return
	}

	if err := db.Ping(); err != nil {
        log.Fatal("Error pinging database:", err)
    }

	// closes the db before exiting this function
	defer db.Close()

	// setup the router and the routes
	router := gin.Default()

	if (mode != "production") {
		config := cors.DefaultConfig()
		config.AllowOrigins = []string{"http://localhost:3000"}
		config.AllowHeaders = []string{"Content-Type", "Authorization"}

		router.Use(cors.New(config))
	}
	
	if (mode == "production") { 
		// Serve frontend static files
		router.Use(static.Serve("/", static.LocalFile("./gossip-frontend/build", true)))
	}
	subpath := router.Group("/api")

	{
		subpath.GET("/posts/:id", func(context *gin.Context) {
			success, _, requesterId, err := utils.AuthenticateUser(context.GetHeader("Authorization"))
			if (!success || err != nil) {
				context.JSON(http.StatusUnauthorized, gin.H{"error": "You are not authorized"})
				return
			}

			api.GetPost(context, db, requesterId)
		})
		subpath.GET("/posts", func(context *gin.Context) {
			success, _, requesterId, err := utils.AuthenticateUser(context.GetHeader("Authorization"))
			if (!success || err != nil) {
				context.JSON(http.StatusUnauthorized, gin.H{"error": "You are not authorized"})
				return
			}
			
			api.GetPosts(context, db, requesterId)
		})
		subpath.POST("/posts", func(context *gin.Context) {
			success, _, requesterId, err := utils.AuthenticateUser(context.GetHeader("Authorization"))
			if (!success || err != nil) {
				context.JSON(http.StatusUnauthorized, gin.H{"error": "You are not authorized"})
				return
			}
			
			api.CreatePost(context, db, requesterId)
		})
		subpath.DELETE("/posts/:id", func(context *gin.Context) {
			success, requesterRole, requesterId, err := utils.AuthenticateUser(context.GetHeader("Authorization"))
			if (!success || err != nil) {
				context.JSON(http.StatusUnauthorized, gin.H{"error": "You are not authorized"})
				return
			}
			
			api.DeletePost(context, db, requesterRole, requesterId)
		})
		subpath.PATCH("/posts/:id", func(context *gin.Context) {
			success, requesterRole, requesterId, err := utils.AuthenticateUser(context.GetHeader("Authorization"))
			if (!success || err != nil) {
				context.JSON(http.StatusUnauthorized, gin.H{"error": "You are not authorized"})
				return
			}

			api.UpdatePost(context, db, requesterRole, requesterId)
		})

		subpath.GET("/tags", func(context *gin.Context) {
			success, _, _, err := utils.AuthenticateUser(context.GetHeader("Authorization"))
			if (!success || err != nil) {
				context.JSON(http.StatusUnauthorized, gin.H{"error": "You are not authorized"})
				return
			}

			api.GetTags(context, db)
		})
		subpath.POST("/tags", func(context *gin.Context) {
			success, _, _, err := utils.AuthenticateUser(context.GetHeader("Authorization"))
			if (!success || err != nil) {
				context.JSON(http.StatusUnauthorized, gin.H{"error": "You are not authorized"})
				return
			}
			api.CreateTag(context, db)
		})
		subpath.DELETE("/tags/:id", func(context *gin.Context) {
			success, requesterRole, _, err := utils.AuthenticateUser(context.GetHeader("Authorization"))
			if (!success || err != nil) {
				context.JSON(http.StatusUnauthorized, gin.H{"error": "You are not authorized"})
				return
			}

			api.DeleteTag(context, db, requesterRole)
		})

		subpath.GET("/replies/:post_id", func(context *gin.Context) {
			success, _, _, err := utils.AuthenticateUser(context.GetHeader("Authorization"))
			if (!success || err != nil) {
				context.JSON(http.StatusUnauthorized, gin.H{"error": "You are not authorized"})
				return
			}

			api.GetReplies(context, db)
		})
		subpath.POST("/replies", func(context *gin.Context) {
			success, _, requesterId, err := utils.AuthenticateUser(context.GetHeader("Authorization"))
			if (!success || err != nil) {
				context.JSON(http.StatusUnauthorized, gin.H{"error": "You are not authorized"})
				return
			}

			api.CreateReply(context, db, requesterId)
		})
		subpath.DELETE("/replies/:id", func(context *gin.Context) {
			success, requesterRole, requesterId, err := utils.AuthenticateUser(context.GetHeader("Authorization"))
			if (!success || err != nil) {
				context.JSON(http.StatusUnauthorized, gin.H{"error": "You are not authorized"})
				return
			}
			
			api.DeleteReply(context, db, requesterRole, requesterId)
		})
		subpath.PATCH("/replies/:id", func(context *gin.Context) {
			success, requesterRole, requesterId, err := utils.AuthenticateUser(context.GetHeader("Authorization"))
			if (!success || err != nil) {
				context.JSON(http.StatusUnauthorized, gin.H{"error": "You are not authorized"})
				return
			}

			api.EditReply(context, db, requesterRole, requesterId)
		})
		
		subpath.POST("/users/signin", func(context *gin.Context) {
			api.SigninUser(context, db)
		})
		subpath.POST("/users/signup", func(context *gin.Context) {
			_, requesterRole, _, _ := utils.AuthenticateUser(context.GetHeader("Authorization"))

			api.CreateUser(context, db, requesterRole)
		})
		subpath.DELETE("/users/:id", func(context *gin.Context) {
			success, requesterRole, requesterId, err := utils.AuthenticateUser(context.GetHeader("Authorization"))
			if (!success || err != nil) {
				context.JSON(http.StatusUnauthorized, gin.H{"error": "You are not authorized"})
				return
			}

			api.DeleteUser(context, db, requesterRole, requesterId)
		})
		subpath.GET("/users/:id/posts", func(context *gin.Context) {
			success, _, _, err := utils.AuthenticateUser(context.GetHeader("Authorization"))
			if (!success) {
				context.JSON(http.StatusUnauthorized, gin.H{"error": "You are not authorized"})
				return
			}

			if (err != nil) {
				context.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
				return
			}

			api.GetUserPosts(context, db)
		})

		subpath.POST("/likes/:id", func(context *gin.Context) {
			success, _, requesterId, err := utils.AuthenticateUser(context.GetHeader("Authorization"))
			if (!success) {
				context.JSON(http.StatusUnauthorized, gin.H{"error": "You are not authorized"})
				return
			}

			if (err != nil) {
				context.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
				return
			}

			api.LikePost(context, db, requesterId)
		})
		subpath.DELETE("/likes/:id", func(context *gin.Context) {
			success, _, requesterId, err := utils.AuthenticateUser(context.GetHeader("Authorization"))
			if (!success) {
				context.JSON(http.StatusUnauthorized, gin.H{"error": "You are not authorized"})
				return
			}

			if (err != nil) {
				context.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
				return
			}

			api.UnlikePost(context, db, requesterId)
		})
		subpath.GET("/likes", func(context *gin.Context) {
			success, _, requesterId, err := utils.AuthenticateUser(context.GetHeader("Authorization"))
			if (!success) {
				context.JSON(http.StatusUnauthorized, gin.H{"error": "You are not authorized"})
				return
			}

			if (err != nil) {
				context.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
				return
			}

			api.GetLikes(context, db, requesterId)
		})
	}

	if err := router.Run(":8080"); err != nil {
		log.Fatal("Error starting the server:", err)
	}
}








