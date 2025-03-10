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
		adminRoutes.POST("/users", createUser)      // Admins can create users
		adminRoutes.GET("/schedules", getSchedules) // Admin can view all schedules
	}

	// Manager routes (accessible by admins and managers)
	managerRoutes := protected.Group("/manager")
	managerRoutes.Use(RoleMiddleware(ManagerRole))
	{
		adminRoutes.GET("/users", getUsers)           // Managers can get all users
		managerRoutes.GET("/schedules", getSchedules) // Managers can view all schedules
	}

	// Regular routes (accessible by all logged-in users)
	regularRoutes := protected.Group("/user")
	regularRoutes.Use(RoleMiddleware(RegularRole))
	{
		regularRoutes.GET("/schedule", getSchedule) // Regular users can view their own schedule
	}

	// Start the server
	log.Printf("http://localhost:%d", ConfigData.Server.Port)
	engine.Run(fmt.Sprintf(":%d", ConfigData.Server.Port))
}
