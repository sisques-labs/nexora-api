package main

import (
	"log/slog"
	"net/http"
	"os"

	"github.com/sisques-labs/nexora-api/internal/contexts"
	"github.com/sisques-labs/nexora-api/internal/core/application/bus"
	httpserver "github.com/sisques-labs/nexora-api/internal/core/transport/http"
)

func main() {
	if err := run(); err != nil {
		slog.Error("nexora-api exited with error", "error", err)
		os.Exit(1)
	}
}

func run() error {
	addr := os.Getenv("NEXORA_API_ADDR")
	if addr == "" {
		addr = ":8080"
	}

	commandBus := bus.New()
	router := httpserver.NewRouter()
	contexts.Register(router, commandBus)

	slog.Info("nexora-api listening", "addr", addr)
	return http.ListenAndServe(addr, router)
}
