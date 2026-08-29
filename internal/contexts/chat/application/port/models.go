package port

import (
	"context"

	"github.com/sisques-labs/nexora-api/internal/contexts/chat/domain/entities"
)

// ModelsGateway resolves whether a requested model exists in the
// catalog. Today it's implemented by infrastructure/mock; tomorrow an
// HTTP client to nexora-models, without the application layer changing.
type ModelsGateway interface {
	Resolve(ctx context.Context, name string) (entities.Model, error)
}
