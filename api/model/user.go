package model

import (
	"fmt"
	"slices"
	"strings"

	"github.com/bwmarrin/discordgo"
	"gorm.io/gorm"
)

type User struct {
	ID    string `json:"id" gorm:"type:varchar(32);primaryKey"` // Discord UID
	Name  string `json:"name" gorm:"type:text"`                 // Discord User Name
	Roles string `json:"roles" gorm:"type:text;"`               // Discord User Roles (comma separated)
}

// Get Users
func GetUsers() ([]User, error) {
	var users []User
	err := DB.Find(&users).Error
	if err != nil {
		return nil, err
	}
	return users, nil
}

// Get user by ID
func GetUserById(id string) (*User, error) {
	var user User
	err := DB.First(&user, "id = ?", id).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("user with ID %s not found: %w", id, err)
		}
		return nil, fmt.Errorf("error fetching user with ID %s: %w", id, err)
	}
	return &user, nil
}

// Upsert users
func UpsertUsers(members []discordgo.Member) error {
	var users []User
	for _, member := range members {
		user := User{
			ID:    member.User.ID,
			Name:  member.DisplayName(),
			Roles: strings.Join(member.Roles, ","),
		}
		users = append(users, user)
	}
	err := DB.Save(&users).Error
	return err
}

func (u *User) IsAdmin(config DiscordConfig) bool {
	return u.hasRole(config.AdminRoles)
}

func (u *User) IsManager(config DiscordConfig) bool {
	return u.hasRole(config.ManagerRoles)
}

func (u *User) IsMember(config DiscordConfig) bool {
	return u.hasRole(config.MemberRoles)
}

func (u *User) hasRole(roles []string) bool {
	for _, role := range roles {
		if slices.Contains(strings.Split(u.Roles, ","), role) {
			return true
		}
	}
	return false
}
