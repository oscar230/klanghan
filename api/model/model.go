package model

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

// Get Schedule (for user) (GET)
func GetShifts(c *gin.Context) {
	// Retrieve the username from the URL parameter `id`
	// user := c.Param("id")
	var users []User
	DB.Find(&users)
	c.JSON(http.StatusOK, users)
}

// Get Schedule (for user) (GET)
func GetShiftsForUser(c *gin.Context) {
	// Retrieve the username from the URL parameter `id`
	// user := c.Param("id")
	var users []User
	DB.Find(&users)
	c.JSON(http.StatusOK, users)
}

// Get Schedules (GET)
func GetSchedules(c *gin.Context) {
	var users []User
	DB.Find(&users)
	c.JSON(http.StatusOK, users)
}

// Validate login credentials
func ValidateLogin(loginDetails LoginDetails) bool {
	return true // TODO Implement this
}

// Initialize database connection
func InitDB(config Config) {
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

	// Auto-migrate tables
	DB.AutoMigrate(&Attendees{})
	DB.AutoMigrate(&Shift{})
	DB.AutoMigrate(&User{})
	fmt.Println("Database connected & migrated successfully!")
}
