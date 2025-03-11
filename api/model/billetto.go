package model

import (
	"time"

	"github.com/google/uuid"
)

type EventAttendees struct {
	Object string `json:"object,omitempty"`
	Data   []struct {
		ID           string    `json:"id,omitempty"`
		Object       string    `json:"object,omitempty"`
		Barcode      string    `json:"barcode,omitempty"`
		State        string    `json:"state,omitempty"`
		FeeIncluded  bool      `json:"fee_included,omitempty"`
		Name         string    `json:"name,omitempty"`
		Email        string    `json:"email,omitempty"`
		Photo        any       `json:"photo,omitempty"`
		Type         string    `json:"type,omitempty"`
		TicketBuyer  string    `json:"ticket_buyer,omitempty"`
		Order        string    `json:"order,omitempty"`
		Price        int       `json:"price,omitempty"`
		Fee          int       `json:"fee,omitempty"`
		CreatedAt    time.Time `json:"created_at,omitempty"`
		UpdatedAt    time.Time `json:"updated_at,omitempty"`
		Space        any       `json:"space,omitempty"`
		AddressLine1 string    `json:"address_line_1,omitempty"`
		AddressLine2 string    `json:"address_line_2,omitempty"`
		PostalCode   string    `json:"postal_code,omitempty"`
		City         string    `json:"city,omitempty"`
		CountryCode  string    `json:"country_code,omitempty"`
		PhoneNumber  string    `json:"phone_number,omitempty"`
		Scannings    struct {
			Object  string `json:"object,omitempty"`
			Data    []any  `json:"data,omitempty"`
			HasMore bool   `json:"has_more,omitempty"`
			Total   int    `json:"total,omitempty"`
		} `json:"scannings,omitempty"`
		BookingQuestionResponses struct {
			Object  string `json:"object,omitempty"`
			Data    []any  `json:"data,omitempty"`
			HasMore bool   `json:"has_more,omitempty"`
			Total   int    `json:"total,omitempty"`
		} `json:"booking_question_responses,omitempty"`
		OrderLine            string `json:"order_line,omitempty"`
		TicketType           string `json:"ticket_type,omitempty"`
		Event                string `json:"event,omitempty"`
		Membership           any    `json:"membership,omitempty"`
		Subscription         any    `json:"subscription,omitempty"`
		NewsletterPermission bool   `json:"newsletter_permission,omitempty"`
	} `json:"data,omitempty"`
	HasMore bool   `json:"has_more,omitempty"`
	Total   int    `json:"total,omitempty"` // Total number of attendees
	URL     string `json:"url,omitempty"`
	NextURL string `json:"next_url,omitempty"`
}

type Attendees struct {
	ID         uuid.UUID `json:"id" gorm:"type:uuid;default:uuid_generate_v4();primaryKey"`
	Timestamp  time.Time `json:"timestamp" gorm:"type:timestamp;not null"`
	EventID    int       `json:"event_id" gorm:"type:int;not null"`
	SalesCount int       `json:"sales_count" gorm:"type:int;not null"`
	ScanCount  int       `json:"scan_count" gorm:"type:int;not null"`
}

// Convert EventAttendees to Attendees
func (e EventAttendees) ToAttendees(eventID int) Attendees {
	return Attendees{
		ID:         uuid.New(),
		Timestamp:  time.Now(),
		EventID:    eventID,
		SalesCount: e.Total,
		ScanCount:  e.Data[0].Scannings.Total,
	}
}
