package model

import "github.com/google/uuid"

type DiscordWebhook struct {
	ID      uuid.UUID `json:"id" gorm:"type:uuid;default:uuid_generate_v4();primaryKey"`
	URL     string    `json:"url" gorm:"type:varchar(128);unique;not null"`
	Usecase string    `json:"usecase" gorm:"type:varchar(255);not null"` // Can be "system", "billetto" or "access"
}

type EmbedAuthor struct {
	Name    string `json:"name,omitempty"`
	URL     string `json:"url,omitempty"`
	IconURL string `json:"icon_url,omitempty"`
}

type EmbedField struct {
	Name   string `json:"name,omitempty"`
	Value  string `json:"value,omitempty"`
	Inline bool   `json:"inline,omitempty"`
}

type EmbedThumbnail struct {
	URL string `json:"url,omitempty"`
}

type EmbedImage struct {
	URL string `json:"url,omitempty"`
}

type EmbedFooter struct {
	Text    string `json:"text,omitempty"`
	IconURL string `json:"icon_url,omitempty"`
}

type Embed struct {
	Author      EmbedAuthor    `json:"author,omitempty"`
	Title       string         `json:"title,omitempty"`
	URL         string         `json:"url,omitempty"`
	Description string         `json:"description,omitempty"`
	Color       int            `json:"color,omitempty"`
	Fields      []EmbedField   `json:"fields,omitempty"`
	Thumbnail   EmbedThumbnail `json:"thumbnail,omitempty"`
	Image       EmbedImage     `json:"image,omitempty"`
	Footer      EmbedFooter    `json:"footer,omitempty"`
}

type Message struct {
	Username  string  `json:"username,omitempty"`
	AvatarURL string  `json:"avatar_url,omitempty"`
	Content   string  `json:"content,omitempty"`
	Embeds    []Embed `json:"embeds,omitempty"`
}

// Create system webhook
func CreateSystemWebhook(url string) DiscordWebhook {
	return DiscordWebhook{
		ID:      uuid.New(),
		URL:     url,
		Usecase: "system",
	}
}

// Create billetto webhook
func CreateBillettoWebhook(url string) DiscordWebhook {
	return DiscordWebhook{
		ID:      uuid.New(),
		URL:     url,
		Usecase: "billetto",
	}
}

// Create access webhook
func CreateAccessWebhook(url string) DiscordWebhook {
	return DiscordWebhook{
		ID:      uuid.New(),
		URL:     url,
		Usecase: "access",
	}
}

// Get webhook usecases
func GetWebhookUsecases() []string {
	return []string{"system", "billetto", "access"}
}
