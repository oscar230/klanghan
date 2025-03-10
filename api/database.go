package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

// Define the User model
type User struct {
	ID    uint   `gorm:"primaryKey"`
	Name  string `json:"name"`
	Email string `json:"email" gorm:"unique"`
}

// Create User (POST)
func createUser(c *gin.Context) {
	var user User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

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
