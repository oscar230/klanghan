package model

import (
	"fmt"
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID         uuid.UUID `json:"id" gorm:"type:uuid;default:uuid_generate_v4();primaryKey"`
	Name       string    `json:"name" gorm:"type:varchar(255)"`
	DiscordUID string    `json:"discord_uid" gorm:"type:varchar(18);unique""`
	RoleID     int       `json:"role_id" gorm:"type:smallint;not null"`
}

type Role struct {
	ID   int    `json:"id" gorm:"primaryKey"`
	Name string `json:"name" gorm:"type:varchar(255);unique"`
}

type AccessKey struct {
	ID          uuid.UUID `json:"id" gorm:"type:uuid;default:uuid_generate_v4();primaryKey"`
	CreatedTime time.Time `json:"created_time" gorm:"type:timestamp;not null"`
	RoleID      int       `json:"role_id" gorm:"type:smallint;not null"`
	Key         string    `json:"key" gorm:"type:varchar(32);unique;not null"`
}

var AdminRole Role = Role{ID: 1, Name: "admin"}
var ManagerRole Role = Role{ID: 2, Name: "manager"}
var RegularRole Role = Role{ID: 3, Name: "regular"}

func CreateUser(name string, discordUID string) User {
	return User{
		ID:         uuid.New(),
		Name:       name,
		DiscordUID: discordUID,
		RoleID:     RegularRole.ID,
	}
}

func (u *User) GetRole() Role {
	role, err := GetRoleFromID(u.RoleID)
	if err != nil {
		return Role{}
	}
	return role
}

func (u *User) SetRole(role Role) error {
	role, err := GetRoleFromID(u.RoleID)
	if err != nil {
		return err
	}
	u.RoleID = role.ID
	return nil
}

func (u *User) IsAdmin() bool {
	return u.GetRole().Name == AdminRole.Name
}

func (u *User) IsManager() bool {
	return u.GetRole().Name == ManagerRole.Name || u.IsAdmin()
}

func (u *User) IsRegular() bool {
	return u.GetRole().Name == RegularRole.Name || u.IsManager() || u.IsAdmin()
}

func GetRoleFromID(roleID int) (Role, error) {
	switch roleID {
	case 1:
		return AdminRole, nil
	case 2:
		return ManagerRole, nil
	case 3:
		return RegularRole, nil
	default:
		err := fmt.Errorf("Role with ID %d not found", roleID)
		return Role{}, err
	}
}
