package model

import "fmt"

type Config struct {
	Server   ServerConfig   `yaml:"server"`
	Database DatabaseConfig `yaml:"database"`
	Discord  DiscordConfig  `yaml:"discord"`
}

type ServerConfig struct {
	Port         int    `yaml:"port"`
	CookieSecret string `yaml:"cookieSecret"`
}

type DatabaseConfig struct {
	Host     string `yaml:"host"`
	User     string `yaml:"user"`
	Password string `yaml:"password"`
	DBName   string `yaml:"dbname"`
	Port     int    `yaml:"port"`
	SslMode  string `yaml:"sslmode"`
}

type DiscordConfig struct {
	ClientID              string   `yaml:"clientID"`
	ClientSecret          string   `yaml:"clientSecret"`
	BotToken              string   `yaml:"botToken"`
	RedirectURL           string   `yaml:"redirectURL"`
	GuildID               string   `yaml:"guildID"`
	NotificationChannelID string   `yaml:"notificationChannelID"`
	AdminRoles            []string `yaml:"adminRoles"`
	ManagerRoles          []string `yaml:"managerRoles"`
	MemberRoles           []string `yaml:"memberRoles"`
}

func (c Config) Validate() error {
	if err := c.Server.Validate(); err != nil {
		return err
	}

	if err := c.Database.Validate(); err != nil {
		return err
	}

	if err := c.Discord.Validate(); err != nil {
		return err
	}

	return nil
}

func (c ServerConfig) Validate() error {
	if c.Port >= 0 && c.Port <= 1023 {
		return fmt.Errorf("server port in the range 1024 to 65535 is required, 5200 for example")
	}

	if c.CookieSecret == "" {
		return fmt.Errorf("server cookie secret is required")
	}

	return nil
}

func (c DatabaseConfig) Validate() error {
	if c.Host == "" {
		return fmt.Errorf("database host is required, localhost for example")
	}

	if c.User == "" {
		return fmt.Errorf("database user is required, postgres or klanghan for example")
	}

	if c.Password == "" {
		return fmt.Errorf("database password is required")
	} else if len(c.Password) < 8 {
		return fmt.Errorf("database password must be at least 8 characters long")
	}

	if c.DBName == "" {
		return fmt.Errorf("database name is required, klanghan for example")
	}

	if c.Port == 0 {
		return fmt.Errorf("database port is required, 5432 for example")
	}

	if c.SslMode == "" {
		return fmt.Errorf("database ssl mode is required")
	} else if c.SslMode != "disable" && c.SslMode != "allow" && c.SslMode != "prefer" && c.SslMode != "require" && c.SslMode != "verify-ca" && c.SslMode != "verify-full" {
		return fmt.Errorf("database ssl mode must be one of disable, allow, prefer, require, verify-ca, or verify-full")
	}

	return nil
}

func (c DiscordConfig) Validate() error {
	if c.ClientID == "" {
		return fmt.Errorf("discord client ID is required")
	}

	if c.ClientSecret == "" {
		return fmt.Errorf("discord client secret is required")
	}

	if c.BotToken == "" {
		return fmt.Errorf("discord bot token is required")
	}

	if c.GuildID == "" {
		return fmt.Errorf("discord guild ID is required")
	}

	if c.NotificationChannelID == "" {
		return fmt.Errorf("discord notification channel ID is required")
	}

	if len(c.AdminRoles) == 0 {
		return fmt.Errorf("discord admin roles are required")
	}

	if len(c.ManagerRoles) == 0 {
		return fmt.Errorf("discord manager roles are required")
	}

	if len(c.MemberRoles) == 0 {
		return fmt.Errorf("discord member roles are required")
	}

	return nil
}
