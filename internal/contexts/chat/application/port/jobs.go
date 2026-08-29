package port

import (
	"context"

	"github.com/sisques-labs/nexora-api/internal/contexts/chat/domain/entities"
)

// JobsGateway manages the job lifecycle in nexora-jobs.
type JobsGateway interface {
	Create(ctx context.Context, model string) (entities.Job, error)
	MarkScheduled(ctx context.Context, jobID string, nodeID string) (entities.Job, error)
	MarkRunning(ctx context.Context, jobID string) (entities.Job, error)
	MarkCompleted(ctx context.Context, jobID string) (entities.Job, error)
	MarkFailed(ctx context.Context, jobID string, cause error) (entities.Job, error)
}
