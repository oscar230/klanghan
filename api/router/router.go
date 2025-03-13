package router

import (
	"fmt"
	"klanghan-api/middleware/auth"
	"klanghan-api/model"
	"klanghan-api/router/handler"
	"klanghan-api/service"
	"log"

	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
	discordAuth "github.com/ravener/discord-oauth2"
	"golang.org/x/oauth2"
)

func InitRouter(config model.Config) {
	const cookieSessionDiscord = "discord-session"
	var discordOAuthConfig = &oauth2.Config{
		ClientID:     config.Discord.ClientID,
		ClientSecret: config.Discord.ClientSecret,
		RedirectURL:  config.Discord.RedirectURL,
		Scopes:       []string{discordAuth.ScopeIdentify},
		Endpoint:     discordAuth.Endpoint,
	}

	// Create Gin router
	engine := gin.Default()
	engine.SetTrustedProxies(nil) // Handle the client's IP and not the proxy's IP

	// Set up session middleware (secure cookie store)
	store := cookie.NewStore([]byte(config.Server.CookieSecret))
	engine.Use(sessions.Sessions(cookieSessionDiscord, store))

	// Set services
	engine.Use(func(c *gin.Context) {
		discordService, err := service.NewDiscordService(config.Discord)
		if err != nil {
			log.Fatalf("Failed to start Discord service: %v", err)
		}
		c.Set(service.DiscordServiceID, discordService)
		c.Next()
	})
	engine.Use(func(c *gin.Context) {
		databaseService, err := service.NewDatabaseService(config.Database)
		if err != nil {
			log.Fatalf("Failed to start Database service: %v", err)
		}
		c.Set(service.DatabaseServiceID, databaseService)
		c.Next()
	})

	// Health route (public access)
	engine.GET("/health", handler.HealthCheck)

	// Authentication routes (public access)
	engine.GET("/auth/login", handler.LoginHandler(discordOAuthConfig))
	engine.GET("/auth/discord/callback", handler.CallbackHandler(config.Discord, discordOAuthConfig))
	engine.GET("/auth/logout", handler.LogoutHandler)

	// Admin routes (accessible by admins only)
	adminRoutes := engine.Group("/admin")
	adminRoutes.Use(auth.RoleMiddleware(auth.AdminRole, config.Discord))
	{
	}

	// Manager routes (accessible by admins and managers)
	managerRoutes := engine.Group("/manager")
	managerRoutes.Use(auth.RoleMiddleware(auth.ManagerRole, config.Discord))
	{
		managerRoutes.GET("/users", handler.GetUsers)        // Get all users
		managerRoutes.GET("/users/:id", handler.GetUserById) // Get user by ID
		managerRoutes.POST("/shifts", nil)                   // Create shift
		managerRoutes.PUT("/shifts", nil)                    // Update shift
		managerRoutes.GET("/shifts/:id", nil)                // Get shift by ID
		managerRoutes.DELETE("/shifts/:id", nil)             // Reomve shift by ID
	}

	// Regular routes (accessible by all logged-in users)
	regularRoutes := engine.Group("/member")
	regularRoutes.Use(auth.RoleMiddleware(auth.MemberRole, config.Discord))
	{
		regularRoutes.GET("/shifts", nil) // Get all shifts
	}

	// Start the server
	log.Printf("http://localhost:%d", config.Server.Port)
	engine.Run(fmt.Sprintf(":%d", config.Server.Port))
}
