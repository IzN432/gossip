package models

import "time"

type User struct {
	ID        uint      `gorm:"primaryKey;" json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	Username  string    `gorm:"unique;not null;" json:"username"`
	Password  string    `gorm:"not null;" json:"password"`
	Role      string    `gorm:"check:role IN ('superuser', 'admin', 'viewer');" json:"role"`
	Posts     []*Post   `gorm:"foreignKey:OwnerID" json:"posts"`
	Replies   []*Reply  `gorm:"foreignKey:UserID" json:"replies"`
	Likes     []*Like   `gorm:"foreignKey:UserID" json:"likes"`
}

// Omit created at updated at posts replies and likes and password
type UserResponse struct {
	ID       uint   `json:"id"`
	Username string `json:"username"`
	Role     string `json:"role"`
}
