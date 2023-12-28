package utils

import (
	"database/sql"
	"example/gossip/gossip-backend/models"
	"fmt"
)

func TagsExist(tags []models.Tag, db *sql.DB) (bool, error) {
	if len(tags) == 0 {
		return true, nil
	}

	query := `SELECT COUNT(*) FROM tags WHERE id IN (` + generatePlaceholders(len(tags)) + `)`

	var count int

	var tagIDs []any
	for _, tag := range tags {
		tagIDs = append(tagIDs, tag.ID)
	}

	err := db.QueryRow(query, tagIDs...).Scan(&count)

	if err != nil {
		return false, err
	}

	return count == len(tagIDs), nil
}

func generatePlaceholders(count int) string {
	var placeholders string

	for i := 1; i <= count; i++ {
		if i > 1 {
			placeholders += ", "
		}
		placeholders += fmt.Sprintf("$%d", i)
	}

	return placeholders
}