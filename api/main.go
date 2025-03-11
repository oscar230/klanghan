package main

import (
	"klanghan-api/config"
	"klanghan-api/database"
	"log"
)

func main() {
	// Load configuration
	config, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Initialize DB
	database.InitDB(config)

	// Initialize scheduler
	go initScheduler()

	// Initialize API server
	go InitServer(config)

	// Keep the main function alive
	select {}
}
