package main

import (
	"fmt"
	"log"
	"os"

	"gopkg.in/yaml.v3"
)

// Config struct to hold config values
type Config struct {
	Server   ServerConfig   `yaml:"server"`
	Database DatabaseConfig `yaml:"database"`
	Security Security       `yaml:"security"`
}

type ServerConfig struct {
	Port int `yaml:"port"`
}

type DatabaseConfig struct {
	Host     string `yaml:"host"`
	User     string `yaml:"user"`
	Password string `yaml:"password"`
	DBName   string `yaml:"dbname"`
	Port     int    `yaml:"port"`
	SslMode  string `yaml:"sslmode"`
}

type Security struct {
	JWTSecret string `yaml:"jwtSecret"`
}

// LoadConfig loads the configuration from the YAML file
func LoadConfig() {
	// Open the YAML configuration file
	file, err := os.Open("config.yml")
	if err != nil {
		log.Fatal("Could not open config file: ", err)
	}
	defer file.Close()

	// Use yaml.v3 decoder
	decoder := yaml.NewDecoder(file)
	if err := decoder.Decode(&ConfigData); err != nil {
		log.Fatal("Could not decode config file: ", err)
	}

	fmt.Println("Config loaded successfully!")
}
