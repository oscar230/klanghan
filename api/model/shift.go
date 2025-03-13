package model

import (
	"fmt"
	"time"

	"github.com/google/uuid"
)

type Shift struct {
	ID          uuid.UUID `json:"id" gorm:"type:uuid;default:uuid_generate_v4();primaryKey"`
	UserID      string    `json:"user_id" gorm:"type:varchar(18);not null"`
	ShiftRole   string    `json:"shift_role" gorm:"type:varchar(64);not null"`
	StartTime   time.Time `json:"start_time" gorm:"type:timestamp;not null"`
	EndTime     time.Time `json:"end_time" gorm:"type:timestamp;not null"`
	Description string    `json:"description" gorm:"type:text"`
}

// Get shifts
func GetShifts() ([]Shift, error) {
	var shifts []Shift
	err := DB.Find(&shifts).Error
	if err != nil {
		return nil, err
	}
	return shifts, nil
}

// Get shifts by start time and end time
func GetShiftsByTime(startTime time.Time, endTime time.Time) ([]Shift, error) {
	var shifts []Shift
	err := DB.Where("start_time >= ? AND end_time <= ?", startTime, endTime).Find(&shifts).Error
	if err != nil {
		return nil, err
	}
	return shifts, nil
}

// Get shift by ID
func GetShiftById(id uuid.UUID) (*Shift, error) {
	var shift Shift
	err := DB.First(&shift, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &shift, nil
}

// Get shift roles
func GetShiftRoles() ([]string, error) {
	var shiftRoles []string
	err := DB.Model(&Shift{}).Select("shift_role").Group("shift_role").Find(&shiftRoles).Error
	if err != nil {
		return nil, err
	}
	return shiftRoles, nil
}

// Upsert shift that cannot overlap with other shift of the same role
func UpsertShift(shift Shift) error {
	err := IsShiftRoleOverlapping(shift)
	if err != nil {
		return err
	}

	err = IsUserOnAnotherShiftAtTheSameTime(shift)
	if err != nil {
		return err
	}

	err = DB.Save(&shift).Error
	return err
}

// Is shift's role overlapping with other shift of the same role?
func IsShiftRoleOverlapping(shift Shift) error {
	var count int64
	err := DB.Model(&Shift{}).Where("shift_role = ? AND ((start_time BETWEEN ? AND ?) OR (end_time BETWEEN ? AND ?))",
		shift.ShiftRole, shift.StartTime, shift.EndTime, shift.StartTime, shift.EndTime).Count(&count).Error
	if err != nil {
		return err
	} else if count > 0 {
		return fmt.Errorf("shift's role is overlapping with other shift of the same role")
	}
	return nil
}

// Is shift's user on another shift at the same time?
func IsUserOnAnotherShiftAtTheSameTime(shift Shift) error {
	var count int64
	err := DB.Model(&Shift{}).Where("user_id = ? AND ((start_time BETWEEN ? AND ?) OR (end_time BETWEEN ? AND ?))",
		shift.UserID, shift.StartTime, shift.EndTime, shift.StartTime, shift.EndTime).Count(&count).Error
	if err != nil {
		return err
	} else if count > 0 {
		return fmt.Errorf("shift's user is on another shift at the same time")
	}
	return nil
}
