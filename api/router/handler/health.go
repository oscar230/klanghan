package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// Health Check (GET)
func HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, "ONLINE")
}
