package main

import (
	"log"
	"time"

	"github.com/robfig/cron/v3"
)

func initScheduler() {
	// Create a new cron job runner
	c := cron.New()

	// Schedule a job that runs every minute
	_, err := c.AddFunc("*/1 * * * *", func() {
		log.Println("Running scheduled task at", time.Now().Format(time.RFC3339))
		// Add your background task logic here (e.g., cleaning up database, sending emails)
	})
	if err != nil {
		log.Fatalf("Error scheduling task: %v", err)
	}

	// Start the cron scheduler
	c.Start()

	// Log that the scheduler is running
	log.Println("Scheduler started")

}
