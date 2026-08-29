# nexora-api

Nexora's public API. The system's entry point — no business logic of
its own, it orchestrates `nexora-jobs`, `nexora-scheduler` and
`nexora-nodes`. In v0 all three (and the agent `nexora-nodes` forwards
to) are in-process fakes: see `src/contexts/chat/infrastructure/mock`.

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
guide — in short: `src/core/` (shared kernel) + `src/contexts/chat/`
(the only context today) split into `domain/` / `application/` /
`infrastructure/` / `transport/`.

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
`InMemoryModelsGateway` (`nexora-mock-llama-3.1-8b`).

Health check: `curl localhost:8090/healthz` → `{"status":"ok","timestamp":"..."}`.
Swagger docs: `http://localhost:8090/docs`.

## Other commands

```bash
pnpm test        # unit tests
pnpm run lint     # eslint --fix
pnpm run build    # nest build
pnpm run format   # prettier --write
```
