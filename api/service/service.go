package service

import (
	"fmt"

	"github.com/gin-gonic/gin"
)

const DiscordServiceID = "discord"
const DatabaseServiceID = "database"

// Get service from context
func GetDiscordService(c *gin.Context) (*DiscordService, error) {
	discordService, exists := c.Get(DiscordServiceID)
	if !exists {
		return nil, fmt.Errorf("service not found")
	}

	// Assert the correct type
	discordServiceTyped, ok := discordService.(*DiscordService)
	if !ok {
		return nil, fmt.Errorf("service is not of type BotService")
	}
	return discordServiceTyped, nil
}
