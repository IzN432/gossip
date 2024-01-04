package models

import "time"

type Tag struct {
	ID          uint      `gorm:"primaryKey;" json:"id"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	Description string    `json:"description"`
	Posts       []*Post   `gorm:"many2many:post_tag;" json:"posts"`
}

type TagResponse struct {
	ID			uint		`json:"id"`
	Description string    	`json:"description"`
}