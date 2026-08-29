# nexora-api

Nexora's public API. The system's entry point — no business logic of
its own, it orchestrates `nexora-jobs`, `nexora-scheduler`,
`nexora-nodes` and `nexora-models`. Until those exist as separate
services, this repo hosts all of them as their own bounded contexts
(`src/contexts/{jobs,nodes,models,scheduler}`) alongside `chat` (the
only one with a public REST surface), talking to each other through
ports + adapters + `CommandBus`/`QueryBus` — never direct imports. See
AGENTS.md's "Five bounded contexts, one deployable (for now)" for the
full reasoning; it's the load-bearing decision in this repo.

Scope/decisions for v0 are detailed in the [root README](../README.md).
Conventions for anyone (agent or human) writing code here are in
[AGENTS.md](AGENTS.md).

## Stack

NestJS 11 + TypeScript, pnpm — same stack as `gardenia-api`, starting
from `sisques-labs/nestjs-template`. CQRS via `@nestjs/cqrs`, domain
primitives (`BaseException`, value objects) from
`@sisques-labs/nestjs-kit`. No database, message broker or
OpenTelemetry wired yet — see AGENTS.md's "What's deliberately not
here" for why.

`nexora-api` had two earlier v0 prototypes, in Go and in
Java/Spring Boot + Axon, both left unmerged when the stack decision
landed on NestJS (see the root README).

## Architecture

DDD by bounded context + CQRS, mirroring `gardenia-api`. See
[AGENTS.md](AGENTS.md) for the full layout and the "where does X go"
guide — in short: `src/core/` (shared kernel) + five contexts under
`src/contexts/` (`chat`, `jobs`, `nodes`, `models`, `scheduler`), each
split into `domain/` / `application/` / `infrastructure/` (+
`transport/` for `chat` only).

## Run locally

```bash
pnpm install
pnpm run build && node dist/main.js   # or: pnpm run dev (watch mode)
```

Listens on `:8090` by default (`PORT` in `.env`, see `.env.example`).

```bash
curl -X POST localhost:8090/v1/chat/completions \
  -H 'Content-Type: application/json' \
  -d '{"model":"nexora-mock-llama-3.1-8b","messages":[{"role":"user","content":"hello"}]}'
```

The only model available in v0 is hardcoded in
`InMemoryModelsRepository` (`nexora-mock-llama-3.1-8b`).

Health check: `curl localhost:8090/healthz` → `{"status":"ok","timestamp":"..."}`.
Swagger docs: `http://localhost:8090/docs`.

## Other commands

```bash
pnpm test        # unit tests
pnpm run lint     # eslint --fix
pnpm run build    # nest build
pnpm run format   # prettier --write
```
