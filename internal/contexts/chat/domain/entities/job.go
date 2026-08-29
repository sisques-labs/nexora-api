package entities

import "time"

// Status models the lifecycle of an inference job:
// pending → scheduled → running → completed (or failed at any point).
type Status string

const (
	StatusPending   Status = "pending"
	StatusScheduled Status = "scheduled"
	StatusRunning   Status = "running"
	StatusCompleted Status = "completed"
	StatusFailed    Status = "failed"
)

// Job represents an inference request in progress, as seen by
// nexora-api. The source of truth for this aggregate lives in
// nexora-jobs; here it's just the domain entity the use case orchestrates with.
type Job struct {
	ID        string
	Model     string
	Status    Status
	NodeID    string
	CreatedAt time.Time
}
