package models

type Like struct {
	Dislike bool `json:"isDisliked"`
	Like    bool `json:"isLiked"`
	UserID  uint `json:"user_id" gorm:"constraint:OnDelete:CASCADE"`
	PostID  uint `json:"post_id" gorm:"constraint:OnDelete:CASCADE"`
}

type LikeResponse struct {
	Dislike bool `json:"isDisliked"`
	Like    bool `json:"isLiked"`
}
