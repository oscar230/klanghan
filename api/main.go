package main

import (
	"fmt"
	"klanghan-api/model"
	"klanghan-api/router"
	"klanghan-api/service/discord/bot"
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
	model.InitDB(config)

	// Initialize Discord bot
	err = bot.InitBot(config.Discord)
	if err != nil {
		log.Fatalf("Failed to initialize Discord bot: %v", err)
	} else {
		log.Println("Discord bot initialized successfully!")
	}

	// Initialize scheduler
	go initScheduler()

	// Initialize API server
	go router.InitRouter(config)

	// Keep the main function alive
	select {}
}

// LoadConfig loads the configuration from the YAML file
func LoadConfig() (model.Config, error) {
	// Open the YAML configuration file
	file, err := os.Open("config.yml")
	if err != nil {
		log.Fatal("Could not open config file: ", err)
	}
	defer file.Close()

	// Use yaml.v3 decoder
	decoder := yaml.NewDecoder(file)
	var configData model.Config
	if err := decoder.Decode(&configData); err != nil {
		err := fmt.Errorf("failed to decode config file: %v", err)
		return model.Config{}, err
	}

	if err := configData.Validate(); err != nil {
		return model.Config{}, err
	}

	fmt.Println("Config loaded successfully!")
	return configData, nil
}
