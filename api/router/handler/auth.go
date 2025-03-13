package handler

import (
	"fmt"
	"klanghan-api/middleware/auth"
	"klanghan-api/model"
	"net/http"
	"slices"

	"github.com/bwmarrin/discordgo"
	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"golang.org/x/oauth2"
)

// Login handler
func LoginHandler(oauth2Config *oauth2.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		url := oauth2Config.AuthCodeURL("state", oauth2.AccessTypeOffline)
		c.Redirect(http.StatusFound, url)
	}
}

// Callback handler
func CallbackHandler(config model.DiscordConfig, oauth2Config *oauth2.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		code := c.Query("code")
		if code == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Authorization code not provided"})
			return
		}

		token, err := oauth2Config.Exchange(c, code)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		userId, err := UpdateDiscordInfo(token, config, oauth2Config)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		session := sessions.Default(c)
		session.Set(auth.SessionDiscordUIDKey, userId)
		session.Save()

		c.JSON(http.StatusOK, gin.H{"message": "Logged in successfully"})
	}
}

// Logout handler
func LogoutHandler(c *gin.Context) {
	session := sessions.Default(c)
	session.Clear()
	session.Save()
	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}

// Update Discord information
func UpdateDiscordInfo(token *oauth2.Token, config model.DiscordConfig, oauth2Config *oauth2.Config) (*string, error) {
	// Get user info from Discord
	discordUserSession, err := discordgo.New(token.AccessToken)
	if err != nil {
		return nil, err
	}
	defer discordUserSession.Close()

	user, err := discordUserSession.User("@me")
	if err != nil {
		return nil, err
	}

	guildMembers, err := discordUserSession.GuildMembers(config.GuildID, "", 1000)
	if err != nil {
		return nil, err
	} else if len(guildMembers) == 0 {
		return nil, fmt.Errorf("no members found in the Discord guild")
	} else if slices.ContainsFunc(guildMembers, func(member *discordgo.Member) bool {
		return member.User.ID == user.ID
	}) {
		return nil, fmt.Errorf("you are not a member of the Discord guild")
	}

	// Upsert users
	members := make([]discordgo.Member, len(guildMembers))
	for i, member := range guildMembers {
		members[i] = *member
	}
	err = model.UpsertUsers(members)
	if err != nil {
		return nil, err
	}

	return &user.ID, nil
}
