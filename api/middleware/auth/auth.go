package auth

import (
	"klanghan-api/model"
	"net/http"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

const (
	AdminRole   = 1
	ManagerRole = 2
	MemberRole  = 3
)
const SessionDiscordUIDKey = "discord_uid"

func RoleMiddleware(requiredRole int, config model.DiscordConfig) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Check if the required role is valid
		if requiredRole != AdminRole && requiredRole != ManagerRole && requiredRole != MemberRole {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid role"})
			c.Abort()
			return
		}

		// Retrieve the role from the context
		session := sessions.Default(c)
		userId := session.Get(SessionDiscordUIDKey).(string)
		if userId == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "No user found in session"})
			c.Abort()
			return
		}
		user, err := model.GetUserById(userId)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			c.Abort()
			return
		}

		// Check user permission for the required role
		if user.IsAdmin(config) {
			// Dont check required role for admin, they have full permissions
			c.Next()
		} else if (requiredRole == ManagerRole || requiredRole == MemberRole) && user.IsManager(config) {
			// Manager can access manager and member routes
			c.Next()
		} else if requiredRole == MemberRole && user.IsMember(config) {
			// Member can access member routes
			c.Next()
		} else {
			c.JSON(http.StatusForbidden, gin.H{"error": "Insufficient permissions"})
			c.Abort()
			return
		}
	}
}
