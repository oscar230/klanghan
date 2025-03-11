package database

import (
	"klanghan-api/model"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// Get Users (GET)
func GetUsers(c *gin.Context) {
	var users []model.User
	DB.Find(&users)
	c.JSON(http.StatusOK, users)
}

// Get user by ID
func GetUserById(id uuid.UUID) model.User {
	var user model.User
	DB.Where("id = ?", id).First(&user)
	return user
}

// Create User (POST)
func CreateUser(c *gin.Context) {
	type UserInput struct {
		Name       string `json:"name" binding:"required"`
		DiscordUID string `json:"discord_uid" binding:"required"`
	}

	var userInput UserInput
	if err := c.ShouldBindJSON(&userInput); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Create a new user object
	user := model.CreateUser(userInput.Name, userInput.DiscordUID)

	// Insert user into DB
	DB.Create(&user)

	// Return the user object
	c.JSON(http.StatusCreated, user)
}
