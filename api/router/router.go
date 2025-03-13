package router

import (
	"fmt"
	"klanghan-api/middleware/auth"
	"klanghan-api/model"
	"klanghan-api/router/handler"
	"klanghan-api/service"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
	discordAuth "github.com/ravener/discord-oauth2"
	"golang.org/x/oauth2"
)

func InitRouter(config model.Config) {
	const cookieSession = "klanghan-session"
	var discordOAuthConfig = &oauth2.Config{
		ClientID:     config.Discord.ClientID,
		ClientSecret: config.Discord.ClientSecret,
		RedirectURL:  config.Discord.RedirectURL,
		Scopes:       []string{discordAuth.ScopeIdentify},
		Endpoint:     discordAuth.Endpoint,
	}

	// Create Gin router
	engine := gin.Default()
	engine.SetTrustedProxies(config.Server.TrustedProxies)
	engine.Use(cors.New(cors.Config{
		AllowOrigins:     config.Server.CorsAllowOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Content-Type"},
		AllowCredentials: true,
	}))

	// Set up session middleware (secure cookie store)
	store := cookie.NewStore([]byte(config.Server.CookieSecret))
	engine.Use(sessions.Sessions(cookieSession, store))

	// Set up services
	discordService, err := service.NewDiscordService(config.Discord)
	if err != nil {
		log.Fatalf("Failed to start Discord service: %v", err)
	}
	databaseService, err := service.NewDatabaseService(config.Database)
	if err != nil {
		log.Fatalf("Failed to start Database service: %v", err)
	}

	// Graceful shutdown handling
	go gracefulShutdown(discordService, databaseService)

	// Set services
	engine.Use(func(c *gin.Context) {
		c.Set(service.DiscordServiceID, discordService)
		c.Set(service.DatabaseServiceID, databaseService)
		c.Next()
	})

	// Health route (public access)
	engine.GET("/health", handler.HealthCheck)

	// Authentication routes (public access)
	engine.GET("/auth/login", handler.LoginHandler(discordOAuthConfig))
	engine.GET("/auth/discord/callback", handler.CallbackHandler(config.Discord, discordOAuthConfig))

	// Admin routes (accessible by admins only)
	// adminRoutes := engine.Group("/admin")
	// adminRoutes.Use(auth.RoleMiddleware(auth.AdminRole, config.Discord))
	// {
	// }

	// Manager routes (accessible by admins and managers)
	managerRoutes := engine.Group("/manager")
	managerRoutes.Use(auth.RoleMiddleware(auth.ManagerRole, config.Discord))
	{
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
		regularRoutes.GET("/", handler.GetUserCurrent) // Get current user
		regularRoutes.GET("/users", handler.GetUsers)  // Get all users
		regularRoutes.GET("/shifts", nil)              // Get all shifts
	}

	// Start the server
	log.Printf("http://localhost:%d", config.Server.Port)
	engine.Run(fmt.Sprintf(":%d", config.Server.Port))
}

// gracefulShutdown listens for termination signals and ensures proper cleanup of services
func gracefulShutdown(discordService *service.DiscordService, databaseService *service.DatabaseService) {
	// Create a channel to listen for termination signals
	sigs := make(chan os.Signal, 1)
	signal.Notify(sigs, syscall.SIGINT, syscall.SIGTERM)

	// Wait for a termination signal
	sig := <-sigs
	log.Printf("Received signal %s, shutting down gracefully...", sig)

	// Cleanup services
	err := discordService.Close()
	if err != nil {
		log.Printf("Failed to stop Discord service: %v", err)
	} else {
		log.Println("Discord service stopped")
	}
	err = databaseService.Close()
	if err != nil {
		log.Printf("Failed to stop Database service: %v", err)
	} else {
		log.Println("Database service stopped")
	}

	log.Println("Services stopped, exiting...")
	os.Exit(0)
}
