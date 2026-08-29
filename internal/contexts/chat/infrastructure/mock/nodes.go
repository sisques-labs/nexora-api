package mock

import (
	"context"
	"fmt"

	"github.com/sisques-labs/nexora-api/internal/contexts/chat/domain/entities"
	"github.com/sisques-labs/nexora-api/internal/contexts/chat/domain/valueobjects"
)

// NodesGateway stands in for nexora-nodes (and, transitively, the real
// nexora-agent): instead of forwarding the request to a real agent, it
// generates a canned response. It's the README's "fake agent".
type NodesGateway struct {
	node entities.Node
}

func NewNodesGateway() *NodesGateway {
	return &NodesGateway{
		node: entities.Node{
			ID: "mock-node-1",
			Hardware: entities.Hardware{
				CPU:     "Apple M2",
				RAMGB:   16,
				GPU:     "Apple M2 GPU (integrated)",
				VRAMGB:  0,
				Runtime: "llama.cpp (mock)",
			},
		},
	}
}

// OnlyNodeID exposes the single node available in v0, so the scheduler
// mock knows who to route to without querying a real registry.
func (g *NodesGateway) OnlyNodeID() string {
	return g.node.ID
}

func (g *NodesGateway) Dispatch(ctx context.Context, nodeID string, req valueobjects.Request) (valueobjects.Result, error) {
	if nodeID != g.node.ID {
		return valueobjects.Result{}, fmt.Errorf("node %q not found", nodeID)
	}

	lastUserMessage := ""
	for _, m := range req.Messages {
		if m.Role == valueobjects.RoleUser {
			lastUserMessage = m.Content
		}
	}

	reply, err := valueobjects.NewMessage(
		valueobjects.RoleAssistant,
		fmt.Sprintf("[mock inference on %s] echo: %s", g.node.ID, lastUserMessage),
	)
	if err != nil {
		return valueobjects.Result{}, err
	}

	return valueobjects.Result{
		Message:      reply,
		FinishReason: valueobjects.FinishReasonStop,
	}, nil
}
