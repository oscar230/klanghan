package handler

import (
	"encoding/json"
	"fmt"
	"io"
	"klanghan-api/middleware/auth"
	"klanghan-api/model"
	"klanghan-api/service"
	"log"
	"net/http"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"golang.org/x/oauth2"
)

// Login handler
func LoginHandler(oauth2Config *oauth2.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		log.Print("Login initiated")
		url := oauth2Config.AuthCodeURL("state", oauth2.AccessTypeOffline)
		c.Redirect(http.StatusFound, url)
	}
}

// Callback handler
func CallbackHandler(config model.DiscordConfig, oauth2Config *oauth2.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		log.Print("Login callback initiated")
		code := c.Query("code")
		if code == "" {
			log.Print("Login callback failed: Authorization code not provided")
			c.JSON(http.StatusBadRequest, gin.H{"error": "Authorization code not provided"})
			return
		}

		userToken, err := oauth2Config.Exchange(c, code)
		if err != nil {
			log.Printf("Login callback failed to exchange token: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// Get user info from Discord
		userId, err := GetDiscordUserInfo(userToken, c, oauth2Config)
		if err != nil {
			log.Printf("Login callback failed to get Discord user info: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		log.Printf("Login callback successfull for user ID: %s", *userId)

		// Update Discord info
		discordService, err := service.GetDiscordService(c)
		if err != nil {
			log.Printf("Login callback failed to get Discord service: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		err = discordService.UpdateDiscordInfo(*userId)
		if err != nil {
			log.Printf("Login callback failed to update Discord info: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		session := sessions.Default(c)
		session.Set(auth.SessionDiscordUIDKey, userId)
		session.Save()

		log.Print("Login callback successful for user ID: ", userId)
		c.JSON(http.StatusOK, gin.H{"message": "Logged in successfully"})
	}
}

// Logout handler
func LogoutHandler(c *gin.Context) {
	session := sessions.Default(c)
	session.Clear()
	session.Save()
	log.Print("Logged out successfully")
	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}

// Get Discord user info
func GetDiscordUserInfo(userToken *oauth2.Token, c *gin.Context, oauth2Config *oauth2.Config) (*string, error) {
	// Get user info from Discord
	userInfoResponse, err := oauth2Config.Client(c, userToken).Get("https://discord.com/api/users/@me")
	if err != nil {
		return nil, err
	} else if userInfoResponse.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed with status %s to get user info", userInfoResponse.Status)
	}

	// Read response body
	defer userInfoResponse.Body.Close()
	body, err := io.ReadAll(userInfoResponse.Body)
	log.Printf("Got user info from Discord: %s", string(body))
	if err != nil {
		return nil, err
	}

	// Parse Discord user info
	var discordUserInfo struct {
		ID string `json:"id"`
	}
	if err := json.Unmarshal(body, &discordUserInfo); err != nil {
		return nil, err
	}
	return &discordUserInfo.ID, nil
}
