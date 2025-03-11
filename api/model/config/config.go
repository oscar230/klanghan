package config

import "fmt"

type Config struct {
	Server   ServerConfig   `yaml:"server"`
	Database DatabaseConfig `yaml:"database"`
	Security Security       `yaml:"security"`
}

type ServerConfig struct {
	Port int `yaml:"port"`
}

type DatabaseConfig struct {
	Host     string `yaml:"host"`
	User     string `yaml:"user"`
	Password string `yaml:"password"`
	DBName   string `yaml:"dbname"`
	Port     int    `yaml:"port"`
	SslMode  string `yaml:"sslmode"`
}

type Security struct {
	JWTSecret         string `yaml:"jwtSecret"`
	JWTIssuer         string `yaml:"jwtIssuer"`
	JWUExpiresInHours int    `yaml:"jwtExpiresInHours"`
	AdminAccessKey    string `yaml:"adminAccessKey"`
	ManagerAccessKey  string `yaml:"managerAccessKey"`
}

func (sc Security) GetJWTSecret() []byte {
	return []byte(sc.JWTSecret)
}

func (c Config) Validate() error {
	if c.Server.Port >= 0 && c.Server.Port <= 1023 {
		return fmt.Errorf("server port in the range 1024 to 65535 is required, 5200 for example")
	}

	if c.Database.Host == "" {
		return fmt.Errorf("database host is required, localhost for example")
	}

	if c.Database.User == "" {
		return fmt.Errorf("database user is required, postgres or klanghan for example")
	}

	if c.Database.Password == "" {
		return fmt.Errorf("database password is required")
	} else if len(c.Database.Password) < 8 {
		return fmt.Errorf("database password must be at least 8 characters long")
	}

	if c.Database.DBName == "" {
		return fmt.Errorf("database name is required, klanghan for example")
	}

	if c.Database.Port == 0 {
		return fmt.Errorf("database port is required, 5432 for example")
	}

	if c.Database.SslMode == "" {
		return fmt.Errorf("database ssl mode is required")
	} else if c.Database.SslMode != "disable" && c.Database.SslMode != "allow" && c.Database.SslMode != "prefer" && c.Database.SslMode != "require" && c.Database.SslMode != "verify-ca" && c.Database.SslMode != "verify-full" {
		return fmt.Errorf("database ssl mode must be one of disable, allow, prefer, require, verify-ca, or verify-full")
	}

	if c.Security.JWTSecret == "" {
		return fmt.Errorf("JWT secret key is required")
	} else if len(c.Security.JWTSecret) < 32 {
		return fmt.Errorf("JWT secret key must be at least 32 characters long")
	}

	if c.Security.AdminAccessKey == "" {
		return fmt.Errorf("admin access key is required")
	} else if len(c.Security.AdminAccessKey) < 32 {
		return fmt.Errorf("admin access key must be at least 32 characters long")
	}

	if c.Security.ManagerAccessKey == "" {
		return fmt.Errorf("manager access key is required")
	} else if len(c.Security.ManagerAccessKey) < 32 {
		return fmt.Errorf("manager access key must be at least 32 characters long")
	}

	if (c.Security.JWUExpiresInHours < 1) || (c.Security.JWUExpiresInHours > 72) {
		return fmt.Errorf("JWT expiration time must be between 1 and 72 hours")
	}

	if c.Security.JWTIssuer == "" || len(c.Security.JWTIssuer) < 4 {
		return fmt.Errorf("JWT issuer is required of at least length 4")
	}

	return nil
}
