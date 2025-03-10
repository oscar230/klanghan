package main

import (
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// Constants for login credentials
const correctUsername = "admin"
const correctAccessKey = "admin"

// Secret key for signing JWT tokens (store this securely in production)
var jwtSecret = []byte("mysecretkey")

// GenerateJWT generates a JWT token for authenticated users
func GenerateJWT(username string) (string, error) {
	// Set token expiration time (optional, adjust as needed)
	expirationTime := time.Now().Add(24 * time.Hour) // Token valid for 24 hours

	// Create JWT claims
	claims := &jwt.RegisteredClaims{
		Issuer:    "your-app-name",
		Subject:   username,
		ExpiresAt: jwt.NewNumericDate(expirationTime),
	}

	// Create JWT token with claims
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Sign the token with the secret key
	signedToken, err := token.SignedString(jwtSecret)
	if err != nil {
		return "", err
	}

	return signedToken, nil
}

// ValidateJWT validates the JWT token from the Authorization header
func ValidateJWT(tokenString string) (*jwt.Token, error) {
	// Parse and validate the token
	token, err := jwt.ParseWithClaims(tokenString, &jwt.RegisteredClaims{}, func(token *jwt.Token) (interface{}, error) {
		// Ensure that the signing method is correct
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return jwtSecret, nil
	})

	return token, err
}

// JWT Middleware to validate token
func JWTMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get token from Authorization header (Bearer <token>)
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing Authorization header"})
			c.Abort()
			return
		}

		// Split the "Bearer <token>" string
		tokenString := strings.Split(authHeader, " ")[1]
		if tokenString == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		// Validate JWT token
		token, err := ValidateJWT(tokenString)
		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			c.Abort()
			return
		}

		// Optionally, extract user info from token claims
		claims, ok := token.Claims.(*jwt.RegisteredClaims)
		if !ok || claims.Subject == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
			c.Abort()
			return
		}

		// Set the username from claims in the context
		c.Set("username", claims.Subject)

		// Continue processing the request
		c.Next()
	}
}

// Login endpoint to authenticate and return a JWT token
func login(c *gin.Context) {
	var loginDetails struct {
		Username  string `json:"username"`
		AccessKey string `json:"access_key"`
	}

	// Bind JSON request body to loginDetails struct
	if err := c.ShouldBindJSON(&loginDetails); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	// Authenticate the user
	if loginDetails.Username != correctUsername || loginDetails.AccessKey != correctAccessKey {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username or access key"})
		return
	}

	// Generate JWT token
	token, err := GenerateJWT(loginDetails.Username)
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
