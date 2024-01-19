package models

import "time"

type Reply struct {
	ID        uint      `gorm:"primaryKey;" json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	Content   string    `json:"content"`
	PostID    uint      `json:"post_id" gorm:"constraint:OnDelete:CASCADE"`
	UserID    uint      `json:"user_id" gorm:"constraint:OnDelete:CASCADE"`
	Owner     *User     `gorm:"foreignKey:UserID;" json:"owner"`
}

type ReplyResponse struct {
	ID        uint         `gorm:"primaryKey;" json:"id"`
	CreatedAt time.Time    `json:"created_at"`
	Content   string       `json:"content"`
	PostID    uint         `json:"post_id" gorm:"constraint:OnDelete:CASCADE"`
	Owner     UserResponse `json:"owner" gorm:"constraint:OnDelete:CASCADE"`
}
