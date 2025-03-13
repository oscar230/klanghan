package model

import (
	"slices"
	"strings"
)

type User struct {
	ID    string `json:"id" gorm:"type:varchar(32);primaryKey"` // Discord UID
	Name  string `json:"name" gorm:"type:text"`                 // Discord User Name
	Roles string `json:"roles" gorm:"type:text;"`               // Discord User Roles (comma separated)
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
