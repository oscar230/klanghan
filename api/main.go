package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default() // Creates a Gin router with default middleware (logger & recovery)

	// Define a simple GET route
	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "Hello, Gin!"})
	})

	// Start the server
	r.Run(":8080") // Default listens on port 8080
}
