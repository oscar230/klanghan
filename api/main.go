package main

var ConfigData Config

func main() {
	// Load configuration
	LoadConfig()

	// Initialize DB
	initDB()

	// Initialize scheduler
	go initScheduler()

	// Initialize API server
	go initServer()

	// Keep the main function alive
	select {}
}
