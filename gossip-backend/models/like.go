package models

type Like struct {
	Dislike bool `json:"dislike"`
	Like    bool `json:"like"`
	UserID  uint `json:"user_id" gorm:"constraint:OnDelete:CASCADE"`
	PostID  uint `json:"post_id" gorm:"constraint:OnDelete:CASCADE"`
}

type LikeResponse struct {
	Dislike bool `json:"dislike"`
	Like    bool `json:"like"`
}