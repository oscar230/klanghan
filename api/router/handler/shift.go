package handler

import (
	"klanghan-api/model"
	"klanghan-api/service"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// Get shifts
func GetShifts(c *gin.Context) {

	databaseService, err := service.GetDatabaseService(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	shifts, err := databaseService.GetShifts()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, shifts)
}

// Get shifts by start time and end time
func GetShiftsByTime(c *gin.Context) {
	// Parse start time and end time
	startTimeStr := c.Query("startTime")
	endTimeStr := c.Query("endTime")
	startTime, err := time.Parse(time.RFC3339, startTimeStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid start time format"})
		return
	}
	endTime, err := time.Parse(time.RFC3339, endTimeStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid end time format"})
		return
	}

	// Get database service
	databaseService, err := service.GetDatabaseService(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Get shifts
	shifts, err := databaseService.GetShiftsByTime(startTime, endTime)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, shifts)
}

// Get shift by ID
func GetShiftById(c *gin.Context) {
	// Parse shift ID
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid shift ID"})
		return
	}

	// Get database service
	databaseService, err := service.GetDatabaseService(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Get shift
	shift, err := databaseService.GetShiftById(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, shift)
}

// Get shift roles
func GetShiftRoles(c *gin.Context) {
	// Get database service
	databaseService, err := service.GetDatabaseService(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	shiftRoles, err := databaseService.GetShiftRoles()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, shiftRoles)
}

// Upsert shift
func UpsertShift(c *gin.Context) {
	var shift model.Shift
	if err := c.ShouldBindJSON(&shift); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get database service
	databaseService, err := service.GetDatabaseService(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	err = databaseService.UpsertShift(shift)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Shift upserted successfully"})
}
