package model

import "github.com/google/uuid"

type DiscordWebhook struct {
	ID   uuid.UUID `json:"id" gorm:"type:uuid;default:uuid_generate_v4();primaryKey"`
	URL  string    `json:"url" gorm:"type:varchar(128);unique;not null"`
	Name string    `json:"name" gorm:"type:varchar(255);not null"`
}
