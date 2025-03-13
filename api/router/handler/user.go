package handler

import (
	"klanghan-api/middleware/auth"
	"klanghan-api/service"
	"net/http"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

// Get all users
func GetUsers(c *gin.Context) {
	databaseService, err := service.GetDatabaseService(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	users, err := databaseService.GetUsers()
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, users)
}

// Get current user
func GetUserCurrent(c *gin.Context) {
	// Retrieve the user from the context
	session := sessions.Default(c)
	userId := session.Get(auth.SessionDiscordUIDKey).(string)
	if userId == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "No user ID found in the session"})
		return
	}

	// Get database service
	databaseService, err := service.GetDatabaseService(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Get discord service
	discordService, err := service.GetDiscordService(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Get the user by ID
	user, err := databaseService.GetUserById(userId)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	// Set permission
	user.Admin = user.IsAdmin(discordService.Config)
	user.Manager = user.IsManager(discordService.Config)
	user.Member = user.IsMember(discordService.Config)

	c.JSON(http.StatusOK, user)
}

// Get user by ID
func GetUserById(c *gin.Context) {
	id := c.Param("id")

	databaseService, err := service.GetDatabaseService(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	user, err := databaseService.GetUserById(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, user)
}
