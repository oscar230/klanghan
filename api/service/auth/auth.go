package auth

import (
	"klanghan-api/middleware/jwt"
	"klanghan-api/model"
	"klanghan-api/model/config"
	"klanghan-api/service/database"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

// Login endpoint to authenticate and return a JWT token
func Login(securityConfig config.Security, c *gin.Context) {
	var loginDetails model.LoginDetails

	// Bind JSON request body to loginDetails struct
	if err := c.ShouldBindJSON(&loginDetails); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	// Authenticate the user
	if database.ValidateLogin(loginDetails) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username, access key or role"})
		return
	}

	// Generate JWT token
	token, err := jwt.GenerateJWT(securityConfig, loginDetails)
	if err != nil {
		log.Println("Error generating JWT:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	// Return the token in the response
	c.JSON(http.StatusOK, gin.H{
		"token": token,
	})
}
