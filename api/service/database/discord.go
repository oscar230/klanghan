package database

import "klanghan-api/model"

// Get Discord Webhook by use case
func GetDiscordWebhookByUseCase(useCase string) model.DiscordWebhook {
	var discordWebhook model.DiscordWebhook
	DB.Where("use_case = ?", useCase).First(&discordWebhook)
	return discordWebhook
}
