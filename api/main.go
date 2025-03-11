package main

import (
	"fmt"
	"klanghan-api/model/config"
	"klanghan-api/service/database"
	"log"
	"os"

	"gopkg.in/yaml.v3"
)

func main() {
	// Load configuration
	config, err := LoadConfig()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Initialize DB
	database.InitDB(config)

	// Initialize scheduler
	go initScheduler()

	// Initialize API server
	go Serve(config)

	// Keep the main function alive
	select {}
}

// LoadConfig loads the configuration from the YAML file
func LoadConfig() (config.Config, error) {
	// Open the YAML configuration file
	file, err := os.Open("config.yml")
	if err != nil {
		log.Fatal("Could not open config file: ", err)
	}
	defer file.Close()

	// Use yaml.v3 decoder
	decoder := yaml.NewDecoder(file)
	var configData config.Config
	if err := decoder.Decode(&configData); err != nil {
		err := fmt.Errorf("failed to decode config file: %v", err)
		return config.Config{}, err
	}

	if err := configData.Validate(); err != nil {
		return config.Config{}, err
	}

	fmt.Println("Config loaded successfully!")
	return configData, nil
}
