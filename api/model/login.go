package model

import "github.com/google/uuid"

type LoginDetails struct {
	UserID    uuid.UUID `json:"username:requried"`
	AccessKey string    `json:"access_key:required"`
}
