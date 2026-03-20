package router

import (
	"context"
	"fmt"
	"klanghan-api/middleware/auth"
	"klanghan-api/model"
	"klanghan-api/router/handler"
	"klanghan-api/service"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

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

	notImplemented := func(c *gin.Context) {
		c.JSON(http.StatusNotImplemented, gin.H{"error": "Not implemented"})
	}

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
		managerRoutes.POST("/shifts", notImplemented)        // Create shift
		managerRoutes.PUT("/shifts", notImplemented)         // Update shift
		managerRoutes.GET("/shifts/:id", notImplemented)     // Get shift by ID
		managerRoutes.DELETE("/shifts/:id", notImplemented)  // Reomve shift by ID
	}

	// Regular routes (accessible by all logged-in users)
	regularRoutes := engine.Group("/member")
	regularRoutes.Use(auth.RoleMiddleware(auth.MemberRole, config.Discord))
	{
		regularRoutes.GET("/", handler.GetUserCurrent) // Get current user
		regularRoutes.GET("/users", handler.GetUsers)  // Get all users
		regularRoutes.GET("/shifts", notImplemented)   // Get all shifts
	}

	srv := &http.Server{
		Addr:    fmt.Sprintf(":%d", config.Server.Port),
		Handler: engine,
	}

	// Graceful shutdown handling
	go gracefulShutdown(srv, discordService, databaseService)

	// Start the server
	log.Printf("http://localhost:%d", config.Server.Port)
	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("listen: %s\n", err)
	}
}

// gracefulShutdown listens for termination signals and ensures proper cleanup of services
func gracefulShutdown(srv *http.Server, discordService *service.DiscordService, databaseService *service.DatabaseService) {
	// Create a channel to listen for termination signals
	sigs := make(chan os.Signal, 1)
	signal.Notify(sigs, syscall.SIGINT, syscall.SIGTERM)

	// Wait for a termination signal
	sig := <-sigs
	log.Printf("Received signal %s, shutting down gracefully...", sig)

	// Shutdown HTTP server
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server forced to shutdown: ", err)
	}

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
}
