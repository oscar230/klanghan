package service

import (
	"fmt"
	"klanghan-api/model"
	"log"
	"strings"
	"time"

	"github.com/bwmarrin/discordgo"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type DatabaseService struct {
	DB     *gorm.DB
	Config model.DatabaseConfig
}

// Initialize database connection
func NewDatabaseService(config model.DatabaseConfig) (*DatabaseService, error) {
	var DB *gorm.DB
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%d sslmode=%s",
		config.Host,
		config.User,
		config.Password,
		config.DBName,
		config.Port,
		config.SslMode)

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	// Auto-migrate tables
	DB.AutoMigrate(&model.Attendees{})
	DB.AutoMigrate(&model.Shift{})
	DB.AutoMigrate(&model.User{})
	log.Println("Database connected & migrated successfully!")

	log.Println("Database service started")
	return &DatabaseService{
		DB:     DB,
		Config: config,
	}, nil
}

func (d *DatabaseService) Close() error {
	db, err := d.DB.DB()
	if err != nil {
		return err
	}
	return db.Close()
}

// Get Users
func (d *DatabaseService) GetUsers() ([]model.User, error) {
	var users []model.User
	err := d.DB.Find(&users).Error
	if err != nil {
		return nil, err
	}
	return users, nil
}

// Get user by ID
func (d *DatabaseService) GetUserById(id string) (*model.User, error) {
	var user model.User
	err := d.DB.First(&user, "id = ?", id).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("user with ID %s not found: %w", id, err)
		}
		return nil, fmt.Errorf("error fetching user with ID %s: %w", id, err)
	}
	return &user, nil
}

// Upsert users
func (d *DatabaseService) UpsertUsers(members []discordgo.Member) error {
	var users []model.User
	for _, member := range members {
		user := model.User{
			ID:    member.User.ID,
			Name:  member.DisplayName(),
			Roles: strings.Join(member.Roles, ","),
		}
		users = append(users, user)
	}
	err := d.DB.Save(&users).Error
	return err
}

// Get shifts
func (d *DatabaseService) GetShifts() ([]model.Shift, error) {
	var shifts []model.Shift
	err := d.DB.Find(&shifts).Error
	if err != nil {
		return nil, err
	}
	return shifts, nil
}

// Get shifts by start time and end time
func (d *DatabaseService) GetShiftsByTime(startTime time.Time, endTime time.Time) ([]model.Shift, error) {
	var shifts []model.Shift
	err := d.DB.Where("start_time >= ? AND end_time <= ?", startTime, endTime).Find(&shifts).Error
	if err != nil {
		return nil, err
	}
	return shifts, nil
}

// Get shift by ID
func (d *DatabaseService) GetShiftById(id int) (*model.Shift, error) {
	var shift model.Shift
	err := d.DB.First(&shift, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &shift, nil
}

// Get shift roles
func (d *DatabaseService) GetShiftRoles() ([]string, error) {
	var shiftRoles []string
	err := d.DB.Model(&model.Shift{}).Select("shift_role").Group("shift_role").Find(&shiftRoles).Error
	if err != nil {
		return nil, err
	}
	return shiftRoles, nil
}

// Upsert shift that cannot overlap with other shift of the same role
func (d *DatabaseService) UpsertShift(shift model.Shift) error {
	err := d.IsShiftRoleOverlapping(shift)
	if err != nil {
		return err
	}

	err = d.IsUserOnAnotherShiftAtTheSameTime(shift)
	if err != nil {
		return err
	}

	err = d.DB.Save(&shift).Error
	return err
}

// Is shift's role overlapping with other shift of the same role?
func (d *DatabaseService) IsShiftRoleOverlapping(shift model.Shift) error {
	var count int64
	err := d.DB.Model(&model.Shift{}).Where("shift_role = ? AND ((start_time BETWEEN ? AND ?) OR (end_time BETWEEN ? AND ?))",
		shift.ShiftRole, shift.StartTime, shift.EndTime, shift.StartTime, shift.EndTime).Count(&count).Error
	if err != nil {
		return err
	} else if count > 0 {
		return fmt.Errorf("shift's role is overlapping with other shift of the same role")
	}
	return nil
}

// Is shift's user on another shift at the same time?
func (d *DatabaseService) IsUserOnAnotherShiftAtTheSameTime(shift model.Shift) error {
	var count int64
	err := d.DB.Model(&model.Shift{}).Where("user_id = ? AND ((start_time BETWEEN ? AND ?) OR (end_time BETWEEN ? AND ?))",
		shift.UserID, shift.StartTime, shift.EndTime, shift.StartTime, shift.EndTime).Count(&count).Error
	if err != nil {
		return err
	} else if count > 0 {
		return fmt.Errorf("shift's user is on another shift at the same time")
	}
	return nil
}
