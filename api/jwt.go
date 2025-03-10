package main

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// Constants for login credentials
const correctUsername = AdminRole
const correctAccessKey = AdminRole

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

func JWTMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get the token from the Authorization header
		tokenString := c.GetHeader("Authorization")
		if tokenString == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "No token provided"})
			c.Abort()
			return
		}

		// Parse and validate the token
		_, claims, err := parseJWT(tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			c.Abort()
			return
		}

		// Extract user role from the claims
		userRole, ok := claims["role"].(string)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
			c.Abort()
			return
		}

		// Attach the user role to the context for later use
		c.Set("role", userRole)

		// Continue with the request
		c.Next()
	}
}

func parseJWT(tokenString string) (*jwt.Token, jwt.MapClaims, error) {
	// Secret key should be used here to parse and validate the JWT token
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return []byte(ConfigData.Security.JWTSecret), nil
	})
	if err != nil {
		return nil, nil, err
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		return nil, nil, fmt.Errorf("invalid token")
	}

	return token, claims, nil
}

func RoleMiddleware(requiredRole string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Retrieve the role from the context (set by the JWT middleware)
		role, exists := c.Get("role")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "No role found in token"})
			c.Abort()
			return
		}

		// Check if the user's role matches the required role
		switch requiredRole {
		case AdminRole:
			if role != AdminRole {
				c.JSON(http.StatusForbidden, gin.H{"error": "Insufficient permissions"})
				c.Abort()
				return
			}
		case ManagerRole:
			if role != AdminRole && role != ManagerRole {
				c.JSON(http.StatusForbidden, gin.H{"error": "Insufficient permissions"})
				c.Abort()
				return
			}
		case RegularRole:
			if role != AdminRole && role != ManagerRole && role != RegularRole {
				c.JSON(http.StatusForbidden, gin.H{"error": "Insufficient permissions"})
				c.Abort()
				return
			}
		}

		// Continue with the request
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
