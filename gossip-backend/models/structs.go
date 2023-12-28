package models

import "time"

type User struct {
	ID        int       `json:"id"`
	Username  string    `json:"username"`
	Password string		`json:"password"`
	Role      string    `json:"role"`
	CreatedAt time.Time `json:"created_at"`
}

type Tag struct {
	ID          int    `json:"id"`
	Description string `json:"description"`
}

type Reply struct {
	ID        int       `json:"id"`
	Content   string    `json:"content"`
	PostID    int       `json:"post_id"`
	Owner     User      `json:"owner"`
	CreatedAt time.Time `json:"created_at"`
}

type Post struct {
	ID        int       	`json:"id"`
	Title     string    	`json:"title"`
	Content   string    	`json:"content"`
	Owner     User      	`json:"owner"`
	CreatedAt time.Time 	`json:"created_at"`
	Tags      []Tag     	`json:"tags"`
	Replies   []Reply   	`json:"replies"`
	Like	  Like			`json:"like"`
	Likes	  int			`json:"likes"`
	Dislikes  int			`json:"dislikes"`
}

type Like struct {
	Interacted 		bool 	`json:"interacted"`
	LikeOrDislike	bool	`json:"like_or_dislike"`
	UserID			int		`json:"user_id"`
	PostID			int		`json:"post_id"`
}