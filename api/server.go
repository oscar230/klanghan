package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

// Health Check (GET)
func healthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, "ONLINE")
}

func initServer() {

	// Create Gin router
	engine := gin.Default()
	engine.SetTrustedProxies(nil) // Handle the client's IP and not the proxy's IP

	// Health route (public access)
	engine.GET("/health", healthCheck)
	// Login route (public access)
	engine.POST("/login", login)

	// Group of routes that require authentication via JWT
	protected := engine.Group("/protected")
	protected.Use(JWTMiddleware())

	// Admin routes (accessible by admins only)
	adminRoutes := protected.Group("/admin")
	adminRoutes.Use(RoleMiddleware(AdminRole))
	{
		adminRoutes.POST("/users", createUser) // Create users
		adminRoutes.PUT("/users", createUser)  // Update users
		adminRoutes.DELETE("/users/:id", nil)  // Remove user
	}

	// Manager routes (accessible by admins and managers)
	managerRoutes := protected.Group("/manager")
	managerRoutes.Use(RoleMiddleware(ManagerRole))
	{
		managerRoutes.GET("/users", getUsers) // Get all users

		managerRoutes.POST("/shifts", getSchedules)       // Create shift
		managerRoutes.PUT("/shifts", getSchedules)        // Update shift
		managerRoutes.GET("/shifts/:id", getSchedules)    // Get shift
		managerRoutes.DELETE("/shifts/:id", getSchedules) // Reomve shift
	}

	// Regular routes (accessible by all logged-in users)
	regularRoutes := protected.Group("/user")
	regularRoutes.Use(RoleMiddleware(RegularRole))
	{
		regularRoutes.GET("/shifts", getShifts) // Get all shifts
	}

	// Start the server
	log.Printf("http://localhost:%d", ConfigData.Server.Port)
	engine.Run(fmt.Sprintf(":%d", ConfigData.Server.Port))
}
