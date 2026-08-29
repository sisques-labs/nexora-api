package mock

import (
	"context"

	"github.com/sisques-labs/nexora-api/internal/contexts/chat/domain/entities"
	"github.com/sisques-labs/nexora-api/internal/contexts/chat/domain/exceptions"
	"github.com/sisques-labs/nexora-api/internal/core/domain/apperr"
)

// ModelsGateway is a hardcoded catalog of a single model, until
// nexora-models exists.
type ModelsGateway struct {
	model entities.Model
}

func NewModelsGateway() *ModelsGateway {
	return &ModelsGateway{model: entities.Model{Name: "nexora-mock-llama-3.1-8b"}}
}

func (g *ModelsGateway) Resolve(ctx context.Context, name string) (entities.Model, error) {
	if name != g.model.Name {
		return entities.Model{}, apperr.NotFound(exceptions.NewModelNotFound(name, g.model.Name))
	}
	return g.model, nil
}
