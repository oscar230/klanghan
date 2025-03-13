package model

import (
	"time"
)

type Shift struct {
	ID          int       `json:"id" gorm:"primaryKey;autoIncrement"`
	UserID      string    `json:"user_id" gorm:"type:varchar(18);not null"`
	ShiftRole   string    `json:"shift_role" gorm:"type:varchar(64);not null"`
	StartTime   time.Time `json:"start_time" gorm:"type:timestamp;not null"`
	EndTime     time.Time `json:"end_time" gorm:"type:timestamp;not null"`
	Description string    `json:"description" gorm:"type:text"`
}
