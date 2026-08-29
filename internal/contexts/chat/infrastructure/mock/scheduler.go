package mock

import (
	"context"
	"fmt"

	"github.com/sisques-labs/nexora-api/internal/contexts/chat/domain/entities"
)

// SchedulerGateway stands in for nexora-scheduler. In v0, with a
// single node registered, there's no real decision to make: it's a
// direct router.
type SchedulerGateway struct {
	onlyNodeID string
}

func NewSchedulerGateway(onlyNodeID string) *SchedulerGateway {
	return &SchedulerGateway{onlyNodeID: onlyNodeID}
}

func (g *SchedulerGateway) SelectNode(ctx context.Context, j entities.Job) (string, error) {
	if g.onlyNodeID == "" {
		return "", fmt.Errorf("no node registered")
	}
	return g.onlyNodeID, nil
}
