package utils

import (
	"example/gossip/gossip-backend/models"

	"gorm.io/gorm"
)

func TagsExist(tags []*models.Tag, db *gorm.DB) (bool, error) {
	if len(tags) == 0 {
		return true, nil
	}

	var tagIDs []any
	for _, tag := range tags {
		tagIDs = append(tagIDs, tag.ID)
	}

	var count int64
	db.Model(&models.Tag{}).Where(`id IN (?)`, tagIDs).Count(&count)

	return count == int64(len(tagIDs)), nil

}
