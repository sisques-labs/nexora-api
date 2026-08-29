package port

import (
	"context"

	"github.com/sisques-labs/nexora-api/internal/contexts/chat/domain/entities"
)

// SchedulerGateway decides which node a job goes to. In v0, with a
// single node registered, it's effectively a direct router, not a real decision.
type SchedulerGateway interface {
	SelectNode(ctx context.Context, j entities.Job) (nodeID string, err error)
}
