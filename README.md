# nexora-api

Nexora's public API. The system's entry point — no business logic of
its own, it orchestrates `nexora-jobs`, `nexora-scheduler` and
`nexora-nodes`. In v0 all three (and the agent `nexora-nodes` forwards
to) are in-process fakes: see
`contexts/chat/infrastructure/mock`.

Scope/decisions for v0 are detailed in the [root README](../README.md).
Conventions for anyone (agent or human) writing code here are in
[AGENTS.md](AGENTS.md).

## Stack

Java 21 + Spring Boot 3.5.3, Maven. CQRS via
[Axon Framework](https://www.axoniq.io/) 4.11.2 (`CommandGateway` /
`@CommandHandler`, in-memory bus — no Axon Server, `axon.axonserver.enabled=false`
in `application.yml`), which plays the same role `@nestjs/cqrs` plays in
`gardenia-api`. See the "Spring Boot vs Axon" note in AGENTS.md for why
this pins Spring Boot to 3.5.x rather than the current 4.x line.

## Architecture

DDD by bounded context + CQRS, mirroring the sisques-labs `nestjs-template`
layout. Everything lives under `src/main/java/com/sisqueslabs/nexora/api/`:

- `core/` — shared kernel, cross-cutting to every context.
  - `domain/apperr/` — `ApplicationException` hierarchy (`NotFoundException`,
    ...) that transport translates to HTTP status codes.
  - `transport/http/` — `GlobalExceptionHandler` (`@RestControllerAdvice`)
    and the OpenAI-style `ErrorResponse` shape.
  - (No `application/bus/` — Axon's `CommandGateway`/`@CommandHandler` is
    the mediator here, wired by Spring, not hand-rolled.)
- `contexts/` — one folder per bounded context. Today there's a single
  one, `chat`.
  - `chat/`
    - `domain/` — pure entities and value objects, no framework
      dependencies (`entities/`: `Job`, `Node`, `Model`; `valueobjects/`:
      `MessageValueObject`, `RequestValueObject`, `ResultValueObject`,
      `RoleValueObject`, `FinishReasonValueObject`; `exceptions/`:
      `ModelNotFoundException`).
    - `application/` — use cases.
      - `command/<name>/` — one folder per command, holding the
        `*Command` record, the `*Result` record and the `*Handler`
        (`@Component` with an `@CommandHandler`-annotated method), e.g.
        `createchatcompletion/`.
      - `port/` — interfaces the application needs from the other
        services (`JobsGateway`, `SchedulerGateway`, `NodesGateway`,
        `ModelsGateway`). Implemented by mocks today; swapped for real
        HTTP clients later without touching the handler.
    - `infrastructure/mock/` — `@Component` in-memory implementations of
      the ports. Unlike the Go v0, there's no explicit `chat.go`-style
      wiring file: Spring's component scanning + constructor injection
      wires everything (a gateway interface with exactly one `@Component`
      implementation gets autowired wherever it's asked for).
    - `transport/rest/` — `@RestController` + DTOs (Java records). The
      `POST /v1/chat/completions` contract mirrors the OpenAI API's
      shape (`messages[]`/`model` → `choices[].message`).

## Run locally

```bash
mvn spring-boot:run   # listens on :8090 (server.port in application.yml)
```

```bash
curl -X POST localhost:8090/v1/chat/completions \
  -H 'Content-Type: application/json' \
  -d '{"model":"nexora-mock-llama-3.1-8b","messages":[{"role":"user","content":"hello"}]}'
```

The only model available in v0 is hardcoded in
`InMemoryModelsGateway` (`nexora-mock-llama-3.1-8b`).

Health check (Spring Boot Actuator, not a hand-rolled endpoint):
`curl localhost:8090/actuator/health` → `{"status":"UP"}`.

## Other commands

```bash
mvn test    # unit tests
mvn verify  # test + package
mvn compile # compile only
```
