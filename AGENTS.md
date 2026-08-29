# Agent Conventions — nexora-api

Conventions for any agent (or human) writing code in this repo. This
file is the authoritative source — if the code disagrees with this
file, that's a bug in one of the two; fix it, don't just pick a side.

## Tech stack

- Java 21, Maven, Spring Boot **3.5.3** (not the current 4.x line — see
  "Spring Boot vs Axon" below for why).
- Spring MVC (servlet, embedded Tomcat), not WebFlux. Nothing in v0
  (in-process mocks, no streaming) benefits from reactive; it would
  only add a harder mental/debugging model for no payoff yet.
- CQRS via [Axon Framework](https://www.axoniq.io/) 4.11.2
  (`axon-spring-boot-starter`), in-memory bus (`axon.axonserver.enabled=false`
  in `application.yml` — no Axon Server process needed for v0).
- Testing: JUnit 5 + AssertJ (both come from `spring-boot-starter-test`).
  No mocking framework — see "Testing" below.
- Commits: [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`, ...). No AI attribution in commit messages or PR descriptions.

### Spring Boot vs Axon

Spring Boot's current line is 4.x, but Axon Framework's latest release
with a working Spring Boot starter is 4.11.2, which only supports Spring
Boot 3.x. Axon 5 exists only as a `5.0.0-M1` milestone with no Spring
Boot starter yet. Since the whole point of pulling in Axon was to get
NestJS-`@nestjs/cqrs`-style `CommandGateway`/`@CommandHandler` ergonomics
(not to chase the newest Spring Boot line), this repo pins
`spring-boot-starter-parent` to `3.5.3`. Revisit this pin once Axon ships
Spring Boot 4 support — don't upgrade Spring Boot alone without checking
Axon compatibility first.

## Architecture: DDD by bounded context + CQRS

This mirrors the layout used across sisques-labs services
(`nestjs-template`, `gardenia-api`) and the nexora-api Go v0 prototype
that came before this one, translated to Java/Spring idiom. Package
root: `com.sisqueslabs.nexora.api`.

```
com/sisqueslabs/nexora/api/
  core/                        # shared kernel — cross-cutting, not a business context
    domain/apperr/             # ApplicationException hierarchy, framework-agnostic
    transport/http/            # GlobalExceptionHandler, ErrorResponse
  contexts/
    chat/
      domain/
        entities/              # identity-bearing types with a lifecycle (Job, Node, Model)
        valueobjects/          # validated, immutable *ValueObject records/enums
        exceptions/            # typed domain exceptions (e.g. ModelNotFoundException)
      application/
        command/<name>/        # one folder per command: *Command, *Result, *Handler
        port/                  # interfaces the application needs from other services (one file per gateway)
      infrastructure/
        mock/                  # @Component in-memory fakes implementing the ports (v0 only — see below)
      transport/
        rest/
          <Name>Controller.java
          dto/                 # request/response records + toDomain() mapping
```

Unlike the Go v0, there is **no hand-rolled CQRS bus and no explicit
per-context wiring file** (Go's `chat.go` had a `Register(...)` function
that manually constructed every gateway and registered every handler —
that was working around Go having no DI container). Here:

- Axon's `CommandGateway` + `@CommandHandler` is the mediator — a
  controller injects `CommandGateway` and calls `sendAndWait(command)`,
  never the handler class directly.
- Spring's component scanning + constructor injection does all the
  wiring: a port interface with exactly one `@Component` implementing it
  gets autowired automatically wherever it's asked for in a constructor.
  Don't write a manual wiring/factory class to do what `@Component` +
  constructor injection already does.

### Where does X go?

- **A new use case (write)** → `contexts/<context>/application/command/<name>/`,
  with a `<Name>Command` record, a `<Name>Result` record, and a `<Name>Handler`
  (`@Component`, one `@CommandHandler`-annotated method). No test class is
  optional — cover the success path and at least one failure path.
- **A new use case (read)** → same shape under `application/query/<name>/`,
  using Axon's `QueryGateway`/`@QueryHandler` (none yet in nexora-api).
- **A new external dependency** (another Nexora service, a DB, a queue) →
  define the interface in `application/port/`, implement it in
  `infrastructure/` (`infrastructure/mock/` until the real thing exists,
  then e.g. `infrastructure/httpclient/` or `infrastructure/persistence/`).
  Application code depends on the port, never the concrete implementation.
- **A validated primitive with construction rules** (a role, a
  non-empty string, an ID with a specific format) → `domain/valueobjects/`,
  named `<Name>ValueObject` (never `VO`, never the bare name — e.g.
  `MessageValueObject`, not `Message`). A record with validation in its
  compact constructor if it's a product type; an enum if it's a closed
  set of values. Throw `IllegalArgumentException` on an invalid value —
  `GlobalExceptionHandler` maps it to 400 automatically.
- **Something with identity and a lifecycle** (created, transitions
  through states) → `domain/entities/`. Model it as an immutable record
  with `with*`/`mark*` methods that return a new instance, same as `Job`.
- **A domain-specific failure** (not found, conflict, invalid state
  transition) → a typed exception in `domain/exceptions/`, extending the
  right `core.domain.apperr` base (`NotFoundException`, ...) — not a bare
  `RuntimeException` that `GlobalExceptionHandler` can't route on type.
- **A new bounded context** → new folder under `contexts/` with the same
  four sub-layers. No registration step needed beyond that — component
  scanning from `NexoraApiApplication` picks it up automatically.
- **Anything cross-cutting to every context** (not owned by one business
  area) → `core/`. Don't put context-specific logic in `core/` and don't
  put shared plumbing inside a context.

### Mocks (v0-specific, will go away)

`nexora-jobs`, `nexora-scheduler`, `nexora-nodes` and `nexora-models` are
separate repos that don't exist as running services yet. Until they do,
`contexts/chat/infrastructure/mock/` implements their ports in-memory,
inside nexora-api's own process. When a real service comes online, add a
new `@Component` implementation of the same port (e.g.
`infrastructure/httpclient/HttpJobsGateway.java`) — Spring will refuse to
start if two `@Component`s implement the same port with no `@Primary`/
`@Qualifier` to break the tie, so remove or `@Profile`-gate the mock when
you add the real one. The domain, application and transport layers must
not change.

## Errors

`core.domain.apperr.ApplicationException` is the base for errors that
should produce a specific HTTP status instead of an unexpected 500.
Today: `NotFoundException` → 404. Anything not caught by
`GlobalExceptionHandler`'s specific handlers falls through to its
`Exception` handler → 500. `IllegalArgumentException` (including from a
value object's compact constructor) → 400 — this is the one place Java's
built-in exception type is used directly instead of a custom
`apperr` type, since `IllegalArgumentException` already says exactly
what happened and there's no need to reinvent it.

Axon wraps whatever a `@CommandHandler` throws in a
`CommandExecutionException`; `GlobalExceptionHandler` unwraps it and
re-dispatches by the real cause's type — don't add a second, separate
unwrapping step in a controller.

`core.transport.http.GlobalExceptionHandler` is the single place that
maps an exception to an HTTP status + OpenAI-style error `type` — don't
duplicate that mapping in a controller.

## Naming

**No short, undescriptive variable names.** A reader shouldn't have to
scroll up to a declaration to know what a variable means. Java's own
conventions already push hard in this direction (unlike Go, there's no
"receivers stay short" idiom to reconcile with) — full words:
`message`, `request`, `handler`, `gateway`, not `m`, `req`, `h`, `g`.

Standard, narrow exceptions: loop indices `i`/`j` in a tight numeric
loop, `e` for a caught exception used only to read `.getMessage()`
inline, single-letter type parameters (`T`, `K`, `V`).

Other naming rules already in effect in the codebase:

- Every type in `domain/valueobjects/` is named `<Name>ValueObject`
  (`RoleValueObject`, `MessageValueObject`, `RequestValueObject`,
  `ResultValueObject`, `FinishReasonValueObject`). Same convention
  `gardenia-api` uses.
- Interfaces implemented by mocks/adapters are named after what they
  provide, suffixed `Gateway` when they proxy another service
  (`JobsGateway`, `NodesGateway`) — not `I`-prefixed, not suffixed
  `Interface`. Implementations are prefixed by what backs them
  (`InMemoryJobsGateway`, later `HttpJobsGateway`).
- Commands/results/handlers are prefixed by the use case name in
  PascalCase, matching the folder (`createchatcompletion/` holds
  `CreateChatCompletionCommand`, `CreateChatCompletionResult`,
  `CreateChatCompletionHandler`) — the folder is lowercase (Java package
  naming convention), the types inside are PascalCase (Java type
  naming convention); don't force one convention onto the other.
- Domain types (`domain/`) never import from `infrastructure/` or
  `transport/`. Dependencies point inward: transport → application →
  domain, infrastructure → application's ports.

## Testing

- Unit tests live under `src/test/java`, mirroring the main package
  structure, one test class per production class
  (`CreateChatCompletionHandlerTest` next to where
  `CreateChatCompletionHandler` would be if it were in `src/test`).
- No mocking framework (no Mockito) — construct the real
  `infrastructure/mock` gateways as test fixtures, exactly like
  production wiring does, just without Spring's container (`new
  InMemoryJobsGateway()`, not `@Autowired`). A unit test for a handler
  should not need to boot Spring at all.
- Every new command/query handler needs at least: one test for the
  success path, one for each distinct failure path that maps to a
  different HTTP status.
- `mvn test` runs everything. There's no integration or E2E layer yet —
  nexora-api has no real external dependency to integrate against until
  the other services exist.

## Before opening a PR

```bash
mvn verify   # compile + test + package
```

There's no linter/formatter (Checkstyle, Spotless) or CI wired up yet.

## Style

- Comments explain *why*, not *what*. Don't write a comment that just
  restates the method signature in prose — see the existing domain
  types for the level of comment this codebase expects.
- Everything — code, comments, commit messages, docs — is written in
  English, regardless of what language the conversation with an agent
  happens in.
