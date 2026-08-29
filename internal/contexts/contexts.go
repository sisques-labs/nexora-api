// Package contexts mounts the routes and wiring of each bounded
// context onto the root router. Equivalent to contexts.module.ts:
// adding a new context (e.g. if nexora-api ever gains its own models
// or jobs surface) is adding one line here.
package contexts

import (
	"github.com/go-chi/chi/v5"

	"github.com/sisques-labs/nexora-api/internal/contexts/chat"
	"github.com/sisques-labs/nexora-api/internal/core/application/bus"
)

func Register(r chi.Router, commandBus *bus.Bus) {
	chat.Register(r, commandBus)
}
