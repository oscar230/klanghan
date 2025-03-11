package database

import (
	"fmt"
	"klanghan-api/config"
	"klanghan-api/model"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

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

// Get Users (GET)
func GetUsers(c *gin.Context) {
	var users []model.User
	DB.Find(&users)
	c.JSON(http.StatusOK, users)
}

// Get Schedule (for user) (GET)
func GetShifts(c *gin.Context) {
	// Retrieve the username from the URL parameter `id`
	// user := c.Param("id")
	var users []model.User
	DB.Find(&users)
	c.JSON(http.StatusOK, users)
}

// Get Schedule (for user) (GET)
func GetShiftsForUser(c *gin.Context) {
	// Retrieve the username from the URL parameter `id`
	// user := c.Param("id")
	var users []model.User
	DB.Find(&users)
	c.JSON(http.StatusOK, users)
}

// Get Schedules (GET)
func GetSchedules(c *gin.Context) {
	var users []model.User
	DB.Find(&users)
	c.JSON(http.StatusOK, users)
}

// Validate login credentials
func ValidateLogin(loginDetails model.LoginDetails) bool {
	return true // TODO Implement this
}

// Initialize database connection
func InitDB(config config.Config) {
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%d sslmode=%s",
		config.Database.Host,
		config.Database.User,
		config.Database.Password,
		config.Database.DBName,
		config.Database.Port,
		config.Database.SslMode)

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Auto-migrate User table
	DB.AutoMigrate(&model.User{})
	fmt.Println("Database connected & migrated successfully!")
}
