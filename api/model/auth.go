package model

import (
	"fmt"
	"math/rand"
	"time"

	"github.com/google/uuid"
)

type LoginDetails struct {
	UserID    uuid.UUID `json:"username:requried"`
	AccessKey string    `json:"access_key:required"`
}

type AccessKey struct {
	ID          uuid.UUID `json:"id" gorm:"type:uuid;default:uuid_generate_v4();primaryKey"`
	CreatedTime time.Time `json:"created_time" gorm:"type:timestamp;not null"`
	UserID      uuid.UUID `json:"role_id" gorm:"type:smallint;not null"`
	Key         string    `json:"key" gorm:"type:varchar(32);unique;not null"`
}

// Generate a new access key of variable length that is easy to read
func generateAccessKey(length int) string {
	const charset = "abcdeghkmnrstuvw23456789"
	key := make([]byte, length)
	for i := range key {
		key[i] = charset[rand.Intn(len(charset))]
	}
	return string(key)
}

// Generate a new access key depending on the user's role
func CreateAccessKey(user User) (AccessKey, error) {
	var key string
	switch user.GetRole() {
	case AdminRole:
		key = generateAccessKey(64)
	case ManagerRole:
		key = generateAccessKey(64)
	case RegularRole:
		key = generateAccessKey(8)
	default:
		return AccessKey{}, fmt.Errorf("invalid role")
	}

	return AccessKey{
		ID:          uuid.New(),
		CreatedTime: time.Now(),
		UserID:      user.ID,
		Key:         key,
	}, nil
}
