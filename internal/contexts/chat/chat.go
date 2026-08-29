// Package chat is the "chat" context: it builds its gateways, registers
// its command handler on the bus and mounts its REST routes.
// Equivalent to chat.module.ts in the Nest template, without a DI
// container: the wiring is explicit here.
package chat

import (
	"github.com/go-chi/chi/v5"

	"github.com/sisques-labs/nexora-api/internal/contexts/chat/application/command/createchatcompletion"
	"github.com/sisques-labs/nexora-api/internal/contexts/chat/infrastructure/mock"
	"github.com/sisques-labs/nexora-api/internal/contexts/chat/transport/rest/handler"
	"github.com/sisques-labs/nexora-api/internal/core/application/bus"
)

func Register(r chi.Router, commandBus *bus.Bus) {
	models := mock.NewModelsGateway()
	jobs := mock.NewJobsGateway()
	nodes := mock.NewNodesGateway()
	scheduler := mock.NewSchedulerGateway(nodes.OnlyNodeID())

	bus.Register[createchatcompletion.Command, createchatcompletion.Result](
		commandBus,
		createchatcompletion.NewHandler(models, jobs, scheduler, nodes),
	)

	r.Route("/v1/chat", func(r chi.Router) {
		r.Post("/completions", handler.NewChatCompletionsHandler(commandBus).ServeHTTP)
	})
}
