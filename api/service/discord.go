package service

import (
	"fmt"
	"klanghan-api/model"
	"log"
	"slices"
	"strings"

	"github.com/bwmarrin/discordgo"
)

type DiscordService struct {
	Session *discordgo.Session
	Config  model.DiscordConfig
}

// Initialize the Discord bot service
func NewDiscordService(config model.DiscordConfig) (*DiscordService, error) {
	// Create a new Discord session
	bot, err := discordgo.New(fmt.Sprintf("Bot %s", strings.TrimSpace(config.BotToken)))
	if err != nil {
		return nil, err
	}

	// Enable the required intent
	bot.Identify.Intents = discordgo.IntentGuildMembers

	// Register the ready event
	bot.AddHandler(func(s *discordgo.Session, r *discordgo.Ready) {
		log.Printf("Discord bot ready with %d guilds", len(r.Guilds))
		for _, guild := range r.Guilds {
			log.Printf("\tDiscord guild %s (%s) members %d", guild.Name, guild.ID, guild.MemberCount)
		}
	})

	// Open the Discord session
	err = bot.Open()
	if err != nil {
		return nil, err
	}

	log.Println("Discord bot service started")
	return &DiscordService{
		Session: bot,
		Config:  config,
	}, nil
}

// Close shuts down the bot
func (b *DiscordService) Close() {
	if b.Session != nil {
		b.Session.Close()
		log.Println("Discord bot stopped.")
	}
}

// Update Discord information
func (b *DiscordService) UpdateDiscordInfo(userId string) error {
	// Get the user from the Discord guild
	log.Printf("Getting Discord guild members for guild %s", b.Config.GuildID)
	guildMembers, err := b.Session.GuildMembers(b.Config.GuildID, "", 1000)
	if err != nil {
		return err
	} else if len(guildMembers) == 0 {
		return fmt.Errorf("no members found in the Discord guild")
	}

	// Log the Discord guild members
	for _, member := range guildMembers {
		log.Printf("Discord member %s (%s) roles %s", member.DisplayName(), member.User.ID, member.Roles)
	}

	// Check if the user is not a member of the Discord guild
	if !slices.ContainsFunc(guildMembers, func(member *discordgo.Member) bool {
		return member.User.ID == userId
	}) {
		return fmt.Errorf("you are not a member of the Discord guild")
	}

	// Upsert users
	members := make([]discordgo.Member, len(guildMembers))
	for i, member := range guildMembers {
		members[i] = *member
	}
	err = model.UpsertUsers(members)
	return err
}
