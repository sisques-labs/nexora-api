# nexora-api

Nexora's public API. The system's entry point — no business logic of
its own, it orchestrates `nexora-jobs`, `nexora-scheduler` and
`nexora-nodes`. In v0 all three (and the agent `nexora-nodes` forwards
to) are in-process fakes: see `internal/contexts/chat/infrastructure/mock`.

Scope/decisions for v0 are detailed in the [root README](../README.md).
Conventions for anyone (agent or human) writing code here are in
[AGENTS.md](AGENTS.md).

## Architecture

DDD by bounded context + CQRS, mirroring the sisques-labs `nestjs-template`
layout in Go. Everything lives under `internal/`, split into the same
four layers at both the shared-kernel and per-context level:

- `core/` — shared kernel, cross-cutting to every context.
  - `domain/apperr/` — error categories (`not_found`, `invalid`,
    `internal`) that transport translates to HTTP status codes.
  - `application/bus/` — in-process CQRS mediator (equivalent to Nest's
    `CommandBus`/`QueryBus`): each Command/Query has a Handler
    registered by type, dispatched with generics + reflection.
  - `transport/http/` — root router, middlewares, response helpers and
    the healthcheck endpoint.
- `contexts/` — one folder per bounded context. Today there's a single
  one, `chat`; `contexts.go` wires them all onto the root router
  (equivalent to `contexts.module.ts`).
  - `chat/`
    - `domain/` — pure entities and value objects, no external
      dependencies (`entities/`: Job, Node, Model; `valueobjects/`:
      Message, Request, Result; `exceptions/`: typed domain errors).
    - `application/` — use cases.
      - `command/<name>/` — one folder per command, holding
        `command.go` + `handler.go` (+ `handler_test.go`), e.g.
        `createchatcompletion/`.
      - `port/` — contracts the application needs from the other
        services (`JobsGateway`, `SchedulerGateway`, `NodesGateway`,
        `ModelsGateway`). Implemented by mocks today; swapped for real
        HTTP clients later without touching the handlers.
    - `infrastructure/mock/` — in-memory implementations of the ports.
    - `transport/rest/` — chi router glue, HTTP handlers and DTOs. The
      `POST /v1/chat/completions` contract mirrors the OpenAI API's
      shape (`messages[]`/`model` → `choices[].message`).
    - `chat.go` — the context's wiring: builds gateways, registers the
      command handler, mounts the REST routes. Equivalent to
      `chat.module.ts`.

`cmd/api/main.go` bootstraps the command bus, the root router and
`contexts.Register`.

## Run locally

```bash
make run                        # listens on :8090
NEXORA_API_ADDR=:8091 make run  # or on another port
```

```bash
curl -X POST localhost:8090/v1/chat/completions \
  -H 'Content-Type: application/json' \
  -d '{"model":"nexora-mock-llama-3.1-8b","messages":[{"role":"user","content":"hello"}]}'
```

The only model available in v0 is hardcoded in
`internal/contexts/chat/infrastructure/mock/models.go`
(`nexora-mock-llama-3.1-8b`).

## Other commands

```bash
make test       # go test ./...
make vet        # go vet ./...
make lint       # golangci-lint run ./...
make lint-fix   # golangci-lint run ./... --fix
make fmt        # gofmt -l -w .
make build      # binary at bin/api
make check      # fmt + vet + lint + test — run before opening a PR
```
