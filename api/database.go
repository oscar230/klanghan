package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

const (
	AdminRole   = "admin"
	ManagerRole = "manager"
	RegularRole = "regular"
)

// Define the User model
type User struct {
	ID         uuid.UUID `json:"id" gorm:"type:uuid;default:uuid_generate_v4();primaryKey"`
	Name       string    `json:"name" gorm:"type:varchar(255)"`
	DiscordUID string    `json:"discord_uid" gorm:"type:varchar(18);unique""`
	Role       string    `json:"role" gorm:"type:varchar(7);not null"` // Can be "admin", "manager" or "regular"
}

// Create User (POST)
func createUser(c *gin.Context) {
	var user User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Enforce default role
	user.Role = RegularRole

	// Insert user into DB
	DB.Create(&user)
	c.JSON(http.StatusCreated, user)
}

// Get Users (GET)
func getUsers(c *gin.Context) {
	var users []User
	DB.Find(&users)
	c.JSON(http.StatusOK, users)
}

// Get Schedule (for user) (GET)
func getSchedule(c *gin.Context) {
	// Retrieve the username from the URL parameter `id`
	// user := c.Param("id")
	var users []User
	DB.Find(&users)
	c.JSON(http.StatusOK, users)
}

// Get Schedules (GET)
func getSchedules(c *gin.Context) {
	var users []User
	DB.Find(&users)
	c.JSON(http.StatusOK, users)
}

// Initialize database connection
func initDB() {
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%d sslmode=%s",
		ConfigData.Database.Host,
		ConfigData.Database.User,
		ConfigData.Database.Password,
		ConfigData.Database.DBName,
		ConfigData.Database.Port,
		ConfigData.Database.SslMode)

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Auto-migrate User table
	DB.AutoMigrate(&User{})
	fmt.Println("Database connected & migrated successfully!")
}
