package port

import (
	"context"

	"github.com/sisques-labs/nexora-api/internal/contexts/chat/domain/valueobjects"
)

// NodesGateway resolves the node/agent that will handle the job and
// runs the inference against it. In v0 this includes simulating the
// agent (the "fake agent"); in the future nexora-nodes will bridge to
// the real nexora-agent.
type NodesGateway interface {
	Dispatch(ctx context.Context, nodeID string, req valueobjects.Request) (valueobjects.Result, error)
}
