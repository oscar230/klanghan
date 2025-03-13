package bot

import (
	"fmt"
	"klanghan-api/model"
	"log"
	"slices"
	"strings"

	"github.com/bwmarrin/discordgo"
	"golang.org/x/oauth2"
)

var bot *discordgo.Session

// Initialize the Discord bot
func InitBot(config model.DiscordConfig) error {
	// Create a new Discord session
	bot, err := discordgo.New(fmt.Sprintf("Bot %s", strings.TrimSpace(config.BotToken)))
	if err != nil {
		log.Println("Failed to create Discord bot session")
		return err
	}
	defer bot.Close()

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
	log.Println("Opening Discord bot session")
	err = bot.Open()
	return err
}

// Update Discord information
func UpdateDiscordInfo(userId string, config model.DiscordConfig, oauth2Config *oauth2.Config) error {
	// Get the user from the Discord guild
	guildMembers, err := bot.GuildMembers(config.GuildID, "", 1000)
	if err != nil {
		return err
	} else if len(guildMembers) == 0 {
		return fmt.Errorf("no members found in the Discord guild")
	} else if slices.ContainsFunc(guildMembers, func(member *discordgo.Member) bool {
		return member.User.ID == userId
	}) {
		return fmt.Errorf("you are not a member of the Discord guild")
	}
	for _, member := range guildMembers {
		log.Printf("Discord member %s (%s) roles %s", member.DisplayName(), member.User.ID, member.Roles)
	}

	// Upsert users
	members := make([]discordgo.Member, len(guildMembers))
	for i, member := range guildMembers {
		members[i] = *member
	}
	err = model.UpsertUsers(members)
	return err
}
