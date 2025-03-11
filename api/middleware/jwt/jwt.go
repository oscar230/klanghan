package jwt

import (
	"fmt"
	"klanghan-api/model"
	"klanghan-api/model/config"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func RoleMiddleware(requiredRole model.Role) gin.HandlerFunc {
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
		case model.AdminRole:
			if role != model.AdminRole {
				c.JSON(http.StatusForbidden, gin.H{"error": "Insufficient permissions"})
				c.Abort()
				return
			}
		case model.ManagerRole:
			if role != model.AdminRole && role != model.ManagerRole {
				c.JSON(http.StatusForbidden, gin.H{"error": "Insufficient permissions"})
				c.Abort()
				return
			}
		case model.RegularRole:
			if role != model.AdminRole && role != model.ManagerRole && role != model.RegularRole {
				c.JSON(http.StatusForbidden, gin.H{"error": "Insufficient permissions"})
				c.Abort()
				return
			}
		}

		// Continue with the request
		c.Next()
	}
}

func JWTMiddleware(jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get the token from the Authorization header
		tokenString := c.GetHeader("Authorization")
		if tokenString == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "No token provided"})
			c.Abort()
			return
		}

		// Parse and validate the token
		_, claims, err := parseJWT(jwtSecret, tokenString)
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

// GenerateJWT generates a JWT token for authenticated users
func GenerateJWT(securityConfig config.Security, loginDetails model.LoginDetails) (string, error) {
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

// validateJWT validates the JWT token from the Authorization header
func validateJWT(securityConfig config.Security, tokenString string) (*jwt.Token, error) {
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

func parseJWT(jwtSecret string, tokenString string) (*jwt.Token, jwt.MapClaims, error) {
	// Secret key should be used here to parse and validate the JWT token
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return []byte(jwtSecret), nil
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
