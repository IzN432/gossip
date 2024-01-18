package models

import "time"

type Post struct {
	ID        uint      `gorm:"primaryKey;" json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	OwnerID   uint      `json:"owner_id" gorm:"constraint:OnDelete:CASCADE"`
	Owner     *User     `gorm:"foreignKey:OwnerID" json:"owner"`
	Tags      []*Tag    `gorm:"many2many:post_tag;" json:"tags"`
	Replies   []*Reply  `json:"replies"`
	Likes     []*Like   `gorm:"foreignKey:PostID" json:"likes"`
}

type PostResponse struct {
	ID           uint          `json:"id"`
	CreatedAt    time.Time     `json:"created_at"`
	Title        string        `json:"title"`
	Content      string        `json:"content"`
	Owner        UserResponse  `json:"owner"`
	Tags         []TagResponse `json:"tags"`
	LikeCount    int64         `json:"likeCount"`
	DislikeCount int64         `json:"dislikeCount"`
	Like         LikeResponse  `json:"like"`
	ReplyCount   int64         `json:"replyCount"`
}
