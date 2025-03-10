package main

import (
	"fmt"

	"github.com/gin-gonic/gin"
)

func initServer() {

	// Create Gin router
	r := gin.Default()

	// Routes
	r.POST("/users", createUser)
	r.GET("/users", getUsers)

	// Start the server
	r.Run(fmt.Sprintf(":%d", ConfigData.Server.Port))
}
