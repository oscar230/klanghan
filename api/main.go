package main

var ConfigData Config

func main() {
	// Load configuration
	LoadConfig()

	// Initialize DB
	initDB()

	// Initialize API Server
	initServer()
}
