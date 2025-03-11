package discord

import (
	"bytes"
	"encoding/json"
	"fmt"
	"klanghan-api/database"
	"klanghan-api/model"
	"log"
	"net/http"
)

func SendAccessKey(accessKey model.AccessKey) error {
	// Get the Discord webhook URL
	discordWebhook := database.GetDiscordWebhookByUseCase("access")

	user := database.GetUserById(accessKey.UserID)

	// Send the message
	return send(discordWebhook.URL, model.Message{
		Content: fmt.Sprintf("Hej <@%s>, här är din åtkomstnyckel: `%s`", user.DiscordUID, accessKey.Key),
	})
}

func send(webhookUrl string, message model.Message) error {
	// Convert the payload to JSON
	messageBytes, err := json.Marshal(message)
	if err != nil {
		return fmt.Errorf("failed to marshal JSON: %w", err)
	}

	// Create the POST request
	req, err := http.NewRequest("POST", webhookUrl, bytes.NewBuffer(messageBytes))
	if err != nil {
		return fmt.Errorf("failed to create HTTP request: %w", err)
	}
	log.Printf("HTTP POST %s\n%s", req.URL, messageBytes)

	// Set headers
	req.Header.Set("Content-Type", "application/json")

	// Send the request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send HTTP request: %w", err)
	}
	defer resp.Body.Close()

	// Check the response status
	if resp.StatusCode != http.StatusNoContent {
		return fmt.Errorf("unexpected response status: %s", resp.Status)
	}
	return nil
}
