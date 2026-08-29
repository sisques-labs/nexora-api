// Package httpserver mounts the root HTTP surface: whatever is
// cross-cutting to every context (healthcheck, middlewares) lives here;
// each context registers its own routes.
package httpserver

import (
	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"

	"github.com/sisques-labs/nexora-api/internal/core/health"
	"github.com/sisques-labs/nexora-api/internal/core/httpserver/middleware"
)

func NewRouter() chi.Router {
	r := chi.NewRouter()

	r.Use(chimiddleware.Recoverer)
	r.Use(middleware.Logging)

	r.Get("/healthz", health.Handler)

	return r
}
