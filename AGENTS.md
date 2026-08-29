# Agent Conventions — nexora-api

Conventions for any agent (or human) writing code in this repo. This
file is the authoritative source — if the code disagrees with this
file, that's a bug in one of the two; fix it, don't just pick a side.

## Tech stack

- Go 1.27, standard library `net/http` + [go-chi/chi](https://github.com/go-chi/chi) for routing.
- No ORM, no database driver. nexora-api owns no persistent state of
  its own in v0 — see "Mocks" below.
- Testing: standard library `testing`, no assertion library. Tests are
  co-located as `<file>_test.go` next to the code they cover.
- Linting: `golangci-lint` v2, config in `.golangci.yml`.
- Commits: [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`, ...). No AI attribution in commit messages or PR descriptions.

## Architecture: DDD by bounded context + CQRS

This mirrors the layout used across sisques-labs services
(`nestjs-template`, `gardenia-api`), translated to Go. There is no DI
container: wiring is explicit Go code, not a framework convention.

```
internal/
  core/                      # shared kernel — cross-cutting, not a business context
    domain/apperr/           # error taxonomy (not_found/invalid/internal), framework-agnostic
    application/bus/         # in-process CQRS mediator (generics-based CommandBus/QueryBus)
    transport/http/          # root router, response helpers, middleware, health check
      health/
      middleware/
  contexts/
    contexts.go              # registers every context's routes onto the root router
    <context>/
      <context>.go           # the context's wiring: builds gateways, registers handlers, mounts routes
      domain/
        entities/            # identity-bearing types with a lifecycle (e.g. Job)
        valueobjects/         # validated, immutable *ValueObject types, constructed via New*() (e.g. MessageValueObject)
        exceptions/           # typed domain errors (e.g. ModelNotFound)
      application/
        command/<name>/       # one folder per command: command.go + handler.go + handler_test.go
        query/<name>/          # same shape, for reads (none yet in nexora-api — see below)
        port/                  # interfaces the application needs from other services (one file per gateway)
      infrastructure/
        mock/                  # in-process fakes implementing the ports (v0 only — see below)
      transport/
        rest/
          handler/             # http.Handler implementations, no business logic
          dto/                 # request/response JSON shapes + ToDomain() mapping
```

### Where does X go?

- **A new use case (write)** → `contexts/<context>/application/command/<name>/`, with
  a `Command` struct, a `Handler` with a `Handle(ctx, cmd) (Result, error)` method, and a
  `handler_test.go` covering the success path and at least one failure path.
- **A new use case (read)** → same shape under `application/query/<name>/`.
- **A new external dependency** (another Nexora service, a DB, a queue) → define
  the interface in `application/port/`, implement it in `infrastructure/`
  (`infrastructure/mock/` until the real thing exists, then e.g.
  `infrastructure/httpclient/` or `infrastructure/persistence/`). Application code
  depends on the port, never on the concrete implementation.
- **A validated primitive with construction rules** (a role, a non-empty string, an
  ID with a specific format) → `domain/valueobjects/`, named `<Name>ValueObject`
  (e.g. `MessageValueObject`, `RequestValueObject` — not `VO`, not bare `Message`),
  built via a `New<Name>ValueObject(...)` function that returns `(T, error)`. Never
  a bare struct literal for something with invariants.
- **Something with identity and a lifecycle** (created, transitions through states)
  → `domain/entities/`.
- **A domain-specific failure** (not found, conflict, invalid state transition) →
  a typed error in `domain/exceptions/`, wrapped with the right `apperr` kind where
  it's raised (see "Errors" below) — not a bare `fmt.Errorf` string that transport has
  to pattern-match on.
- **A new bounded context** (nexora-api gains its own surface beyond chat, e.g.
  exposing `/v1/models` directly) → new folder under `contexts/` with the same
  four sub-layers, registered from `contexts/contexts.go`.
- **Anything cross-cutting to every context** (not owned by one business area) →
  `core/`, itself split into the same four layers (see the tree above). Don't put
  context-specific logic in `core/` and don't put shared plumbing inside a context.

### Mocks (v0-specific, will go away)

`nexora-jobs`, `nexora-scheduler`, `nexora-nodes` and `nexora-models` are separate
repos that don't exist as running services yet. Until they do,
`contexts/chat/infrastructure/mock/` implements their ports in-memory, inside
nexora-api's own process. When a real service comes online, add a new
implementation of the same port (e.g. `infrastructure/httpclient/jobs.go`) and
swap it in `chat.go` — the domain, application and transport layers must not change.

## CQRS bus

`core/application/bus` is a generic in-process mediator, equivalent to Nest's
`CommandBus`/`QueryBus`: register a handler once per Command/Query type with
`bus.Register[C, R]`, dispatch it by type with `bus.Dispatch[C, R]`. One `*bus.Bus`
instance is used as the command bus; if/when queries are added, either reuse it or
construct a second instance as the query bus — the implementation is identical,
the separation is one of intent, not mechanism.

Handlers never call each other directly and transport never calls a handler
directly — always through the bus. This keeps `contexts/<context>/<context>.go` as
the single place that wires a use case to its HTTP route.

## Errors

`core/domain/apperr` defines three categories: `KindNotFound`, `KindInvalid`,
`KindInternal`. Any error that should produce a specific HTTP status (404, 400)
must be wrapped with `apperr.NotFound(...)` / `apperr.Invalid(...)` at the point
it's raised (typically in `infrastructure/`). Anything not wrapped defaults to
`KindInternal` → 500. `core/transport/http.StatusAndTypeFor` is the single place
that translates a `Kind` to an HTTP status + OpenAI-style error `type` — don't
duplicate that mapping in a handler.

Prefer a typed error in `domain/exceptions/` over a bare `fmt.Errorf` string
whenever the caller (infrastructure, or eventually another handler) needs to
distinguish this failure from others — see `domain/exceptions/model_not_found.go`
for the pattern.

## Naming

**No short, undescriptive variable names.** A reader shouldn't have to
scroll up to a declaration to know what `j`, `n`, `m`, or `res` means.
Write `job`, `node`, `message`, `result`. This is enforced by the
`varnamelen` linter (`.golangci.yml`) — `make lint` fails on a name
that's too short for its scope.

Exceptions (idiomatic Go, not loopholes): `err`, `ctx`, `ok`, `id`, loop
indices `i`/`j`, `w http.ResponseWriter` / `r *http.Request` in HTTP
handler signatures, `t *testing.T`, `tt` for table-driven test cases.
Method receivers stay short (1-2 letters, e.g. `g *JobsGateway`) — that's
standard Go style (see [Effective Go](https://go.dev/doc/effective_go#receivers)), not a naming violation.

Other naming rules already in effect in the codebase:

- Constructors are `New<Type>(...)`, returning `(T, error)` when the
  type has invariants to validate, or a bare value/pointer otherwise.
- Every type in `domain/valueobjects/` is named `<Name>ValueObject`
  (`RoleValueObject`, `MessageValueObject`, `RequestValueObject`,
  `ResultValueObject`, `FinishReasonValueObject`) — never `VO`, never
  the bare name. Same convention as `gardenia-api`'s
  `{Name}ValueObject` (not `VO`) rule. Yes, this stutters against the
  `valueobjects` package name (`valueobjects.MessageValueObject`) —
  that's the deliberate tradeoff for a name that's unambiguous
  wherever it shows up (a struct field, a log line, a test failure),
  not just at the point where it's package-qualified.
- Interfaces implemented by mocks/adapters are named after what they
  provide, suffixed `Gateway` when they proxy another service
  (`JobsGateway`, `NodesGateway`) — not `I`-prefixed, not suffixed
  `Interface`.
- One command/query per folder, named after the use case in
  lowerCamelCase with no separator (`createchatcompletion`, not
  `create_chat_completion` or `CreateChatCompletion`) — this is a Go
  package name, so it follows Go package-naming conventions, not the
  file-naming convention used elsewhere in the tree.

## Testing

- Unit tests are co-located: `handler_test.go` next to `handler.go`,
  in an external `_test` package (`package createchatcompletion_test`,
  not `package createchatcompletion`) so tests only exercise the
  public API, same discipline as a real caller would.
- No mocking framework — the existing `infrastructure/mock` gateways
  double as test fixtures (see `handler_test.go`). Reach for
  `testing.T` + table-driven tests before reaching for a library.
- Every new command/query handler needs at least: one test for the
  success path, one for each distinct failure path that maps to a
  different `apperr.Kind`.
- `make test` runs everything. There's no integration or E2E layer
  yet — nexora-api has no real external dependency to integrate
  against until the other services exist.

## Before opening a PR

```bash
make check   # fmt + vet + lint + test, in that order
```

`make check` must pass locally before pushing. There's no CI wired up
yet to enforce this automatically.

## Style

- `gofmt` is non-negotiable — `make fmt` before committing, or
  configure your editor to run it on save.
- Comments explain *why*, not *what*. Don't write a comment that just
  restates the function signature in prose — see the existing domain
  types for the level of comment this codebase expects.
- Everything — code, comments, commit messages, docs — is written in
  English, regardless of what language the conversation with an agent
  happens in.
