package main

import (
	"fmt"
	"klanghan-api/middleware/jwt"
	"klanghan-api/model"
	"klanghan-api/model/config"
	"klanghan-api/service/auth"
	"klanghan-api/service/database"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

// Health Check (GET)
func healthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, "ONLINE")
}

func Serve(config config.Config) {
	// Create Gin router
	engine := gin.Default()
	engine.SetTrustedProxies(nil) // Handle the client's IP and not the proxy's IP

	// Health route (public access)
	engine.GET("/health", healthCheck)
	// Login route (public access)
	engine.POST("/login", func(c *gin.Context) {
		auth.Login(config.Security, c)
	})

	// Group of routes that require authentication via JWT
	protected := engine.Group("/protected")
	protected.Use(jwt.JWTMiddleware(config.Security.JWTSecret))

	// Admin routes (accessible by admins only)
	adminRoutes := protected.Group("/admin")
	adminRoutes.Use(jwt.RoleMiddleware(model.AdminRole))
	{
		adminRoutes.POST("/users", database.CreateUser) // Create users
		adminRoutes.PUT("/users", database.CreateUser)  // Update users
		adminRoutes.DELETE("/users/:id", nil)           // Remove user
	}

	// Manager routes (accessible by admins and managers)
	managerRoutes := protected.Group("/manager")
	managerRoutes.Use(jwt.RoleMiddleware(model.ManagerRole))
	{
		managerRoutes.GET("/users", database.GetUsers)             // Get all users
		managerRoutes.POST("/shifts", database.GetSchedules)       // Create shift
		managerRoutes.PUT("/shifts", database.GetSchedules)        // Update shift
		managerRoutes.GET("/shifts/:id", database.GetSchedules)    // Get shift
		managerRoutes.DELETE("/shifts/:id", database.GetSchedules) // Reomve shift
	}

	// Regular routes (accessible by all logged-in users)
	regularRoutes := protected.Group("/user")
	regularRoutes.Use(jwt.RoleMiddleware(model.RegularRole))
	{
		regularRoutes.GET("/shifts", database.GetShifts) // Get all shifts
	}

	// Start the server
	log.Printf("http://localhost:%d", config.Server.Port)
	engine.Run(fmt.Sprintf(":%d", config.Server.Port))
}
