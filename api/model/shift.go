package model

import (
	"time"

	"github.com/google/uuid"
)

type Shift struct {
	ID          uuid.UUID `json:"id" gorm:"type:uuid;default:uuid_generate_v4();primaryKey"`
	UserID      uuid.UUID `json:"user_id" gorm:"type:uuid;not null"`
	ShiftRole   uuid.UUID `json:"shift_role" gorm:"type:uuid;not null"`
	StartTime   time.Time `json:"start_time" gorm:"type:timestamp;not null"`
	EndTime     time.Time `json:"end_time" gorm:"type:timestamp;not null"`
	Description string    `json:"description" gorm:"type:text"`
}

type ShiftRole struct {
	ID          uuid.UUID `json:"id" gorm:"type:uuid;default:uuid_generate_v4();primaryKey"`
	Name        string    `json:"name" gorm:"type:varchar(255);unique;not null"`
	Description string    `json:"description" gorm:"type:text"`
}
