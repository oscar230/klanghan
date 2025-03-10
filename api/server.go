package main

import (
	"fmt"
	"log"

	"github.com/gin-gonic/gin"
)

func initServer() {

	// Create Gin router
	engine := gin.Default()
	engine.SetTrustedProxies(nil) // Handle the client's IP and not the proxy's IP

	// Routes
	engine.POST("/login", login)            // Login route (public access)
	protected := engine.Group("/protected") // Protected routes (require JWT token)
	protected.Use(JWTMiddleware())
	{
		protected.GET("/schedules/:user", getSchedule)
		protected.GET("/schedules", getSchedules)
		protected.POST("/users", createUser)
		protected.GET("/users", getUsers)
	}

	// Start the server
	log.Printf("http://localhost:%d", ConfigData.Server.Port)
	engine.Run(fmt.Sprintf(":%d", ConfigData.Server.Port))
}
