package service

import (
	"fmt"

	"github.com/gin-gonic/gin"
)

const DiscordServiceID = "discord"
const DatabaseServiceID = "database"

// Get discord service from context
func GetDiscordService(c *gin.Context) (*DiscordService, error) {
	discordService, exists := c.Get(DiscordServiceID)
	if !exists {
		return nil, fmt.Errorf("service not found")
	}

	// Assert the correct type
	discordServiceTyped, ok := discordService.(*DiscordService)
	if !ok {
		return nil, fmt.Errorf("service is not of type DiscordService")
	}
	return discordServiceTyped, nil
}

// Get database service from context
func GetDatabaseService(c *gin.Context) (*DatabaseService, error) {
	databaseService, exists := c.Get(DatabaseServiceID)
	if !exists {
		return nil, fmt.Errorf("service not found")
	}

	// Assert the correct type
	databaseServiceTyped, ok := databaseService.(*DatabaseService)
	if !ok {
		return nil, fmt.Errorf("service is not of type DatabaseService")
	}
	return databaseServiceTyped, nil
}
