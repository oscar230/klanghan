package auth

import (
	"fmt"
	"klanghan-api/config"
	"klanghan-api/database"
	"klanghan-api/model"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

var securityConfig config.Security

func initAuth(config config.Config) {
	securityConfig = config.Security
}

// GenerateJWT generates a JWT token for authenticated users
func GenerateJWT(loginDetails model.LoginDetails) (string, error) {
	// Set token expiration time
	expirationTime := time.Now().Add(time.Duration(securityConfig.JWUExpiresInHours) * time.Hour)

	// Create JWT claims
	claims := &jwt.RegisteredClaims{
		Issuer:    securityConfig.JWTIssuer,
		Subject:   loginDetails.UserID.String(),
		ExpiresAt: jwt.NewNumericDate(expirationTime),
	}

	// Create JWT token with claims
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Sign the token with the secret key
	signedToken, err := token.SignedString(securityConfig.GetJWTSecret())
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
		return securityConfig.GetJWTSecret(), nil
	})

	return token, err
}

// Login endpoint to authenticate and return a JWT token
func Login(c *gin.Context) {
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
	token, err := GenerateJWT(loginDetails)
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
