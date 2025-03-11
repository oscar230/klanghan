package billetto

import (
	"encoding/json"
	"fmt"
	"io"
	"klanghan-api/model"
	"log"
	"net/http"
)

func GetEventAttendees(eventId int, AccessKeyId, AccessKeySecret string) (model.EventAttendees, string) {
	// Build url
	url := fmt.Sprintf("https://billetto.dk/api/v3/organiser/events/%d/attendees?limit=0", eventId)

	// Create a new GET request
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		log.Fatal("Error creating request:", err)
	}

	// Set headers
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Api-Keypair", fmt.Sprintf("%s:%s", AccessKeyId, AccessKeySecret))

	// Send the request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Fatal("Error making request:", err)
	}
	defer resp.Body.Close()

	// Read response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Fatal("Error reading response body:", err)
	}

	// Unmarshal JSON into struct
	var data model.EventAttendees
	if err := json.Unmarshal(body, &data); err != nil {
		log.Fatal("Error unmarshalling JSON:", err)
	}

	return data, resp.Header.Get("x-ratelimit-remaining")
}
