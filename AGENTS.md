# Agent Conventions — nexora-api

Conventions for any agent (or human) writing code in this repo. This
file is the authoritative source — if the code disagrees with this
file, that's a bug in one of the two; fix it, don't just pick a side.

nexora-api is meant to be **calcado a `gardenia-api`**: same stack, same
DDD+CQRS+Hexagonal-by-bounded-context layout, same naming conventions,
starting from `sisques-labs/nestjs-template`. Where this repo differs
from that pattern, it's called out explicitly below — treat any
undocumented divergence as a bug, not a new convention.

## Tech stack

- NestJS 11, TypeScript (strict), pnpm.
- CQRS via `@nestjs/cqrs` (`CommandBus`/`QueryBus`, `@CommandHandler`/`@QueryHandler`).
- `@sisques-labs/nestjs-kit` for domain primitives: `BaseException`,
  `ValueObject<T>`, `StringValueObject`, `EnumValueObject<T>`,
  `UuidValueObject`, etc. — don't hand-roll a local equivalent of
  anything the kit already provides.
- REST only in v0 (no GraphQL, no MCP — nothing here justifies either
  yet; add them the way `gardenia-api` does, per context, if/when
  nexora-api needs them).
- No database, no message broker, no OpenTelemetry in v0 (see "What's
  deliberately not here" below).
- Testing: Jest, unit tests co-located as `*.spec.ts`. No `@nestjs/testing`
  in unit tests — manual instantiation only (enforced by `.eslintrc.js`).
- Linting: ESLint (`@typescript-eslint` + `eslint-plugin-boundaries` for
  cross-context import enforcement), Prettier, Husky + lint-staged.
- Commits: [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`, ...). No AI attribution in commit messages or PR descriptions.

## Five bounded contexts, one deployable (for now)

This is the load-bearing architectural decision in this repo, so it
gets its own section before anything else.

`Job`, `Node` and `Model` are **not chat's concepts**. In the full
Nexora platform they're owned by `nexora-jobs`, `nexora-nodes` and
`nexora-models` — separate repos, separate bounded contexts. `chat` (the
context behind `POST /v1/chat/completions`) only ever *orchestrates*
them; it doesn't own their identity, their lifecycle, or their
invariants. Modeling them as `chat`'s own aggregates (an earlier version
of this repo did exactly that, briefly) is a real DDD mistake, not a
naming nitpick — it implies ownership `chat` doesn't have.

Until those other services exist as real deployables, this repo hosts
**all five bounded contexts side by side**, each a full
`domain`/`application`/`infrastructure` (+ `transport` where it has one)
slice under `src/contexts/`:

- `chat` — the only context with REST controllers; the public surface.
- `jobs` — owns the `Job` aggregate and its lifecycle transitions.
- `nodes` — owns the `Node` aggregate and runs (mock) inference.
- `models` — owns the model catalog.
- `scheduler` — decides which node a job goes to (a router in v0).

**A context never imports another context's `domain`/`application`
directly.** The only door between two contexts is: a port (an
interface + `Symbol` token in `application/ports/`) on the calling
side, and an adapter (`infrastructure/adapters/`) that implements that
port by dispatching a `Command`/`Query` into the target context's own
`CommandBus`/`QueryBus`. `.eslintrc.js`'s `boundaries/element-types`
rule enforces this — it isn't just a convention, `pnpm run lint` fails
a direct cross-context import (except from `infrastructure/adapters/`,
the one exempted location). See `chat/infrastructure/adapters/jobs.adapter.ts`
for the reference shape: it imports `jobs`'s `CreateJobCommand` etc.
(legal — it's inside `infrastructure/adapters/`) and translates the
result into `chat`'s own tiny `JobRef` shape (`chat/application/ports/jobs.port.ts`)
before returning it to `chat`'s handler, which never sees `jobs`'s `Job`
aggregate or its `JobSnapshot` DTO at all.

This is exactly the anti-corruption-layer pattern gardenia-api's own
architecture skill documents for cross-context calls inside one
monolith — the difference is that here, every non-`chat` context is
scaffolding for a *future separate repo*, not a permanent sibling
context. When `nexora-jobs` becomes real: delete `src/contexts/jobs/`
from this repo, and change `chat/infrastructure/adapters/jobs.adapter.ts`
(only that file) from a `CommandBus` dispatch to an HTTP client call.
`chat`'s port, its command handler, and everything above it don't
change — that's the whole point of the port existing.

### Why each non-chat context has no REST controller

`jobs`, `nodes`, `models` and `scheduler` aren't part of nexora-api's
public API — the root README is explicit that nexora-api's only public
surface in v0 is `POST /v1/chat/completions`. They're reached
exclusively via `CommandBus`/`QueryBus`, from another context's adapter.
Don't add a controller to one of them "for completeness" — that would
be nexora-api quietly growing a public surface the README doesn't call
for.

## What's deliberately not here (yet)

`nestjs-template` ships TypeORM/Postgres, Kafka, OpenTelemetry,
GraphQL+MCP transports, and Winston logging by default. None of that is
wired into nexora-api right now:

- **No persistence.** Each context's `infrastructure/repositories/`
  holds an in-memory `Map`-backed repository instead of a TypeORM one.
  When a context becomes its own real service, that's also when it
  picks up Postgres — not before.
- **No events/Kafka.** The root README explicitly defers "NATS/eventos"
  past v0. None of the aggregates here (`Job`, `Node`, `Model`) extend
  nestjs-kit's `BaseAggregate` — that base is for event-sourced
  aggregates with uncommitted domain events, and nothing here actually
  needs to publish one yet.
- **No OpenTelemetry/Winston.** Nothing to observe yet that
  `console`/Nest's built-in `Logger` doesn't already cover for a v0.

Add each back the way `gardenia-api` uses it (see its `core/` and a
concrete context like `harvests`) once a real need shows up — don't
wire infrastructure ahead of a context that needs it.

## Architecture: DDD by bounded context + CQRS

```
src/
  main.ts, app.module.ts
  core/                        # shared kernel — cross-cutting, not a business context
    config/                    # app.config.ts, cors-origins.ts
    exceptions/                # invalid-input.exception.ts (extends nestjs-kit's BaseException)
    filters/                   # base-exception.filter.ts — the one place exceptions map to HTTP status
    health/
      transport/rest/controllers/health.controller.ts
      transport/rest/dtos/health-response.dto.ts
  contexts/
    contexts.module.ts         # registers every context module — add a line here per new context
    chat/                      # the public-facing context — see per-context layout below
    jobs/                      # owns Job — no transport/rest (see "no REST controller" above)
    nodes/                     # owns Node — no transport/rest
    models/                    # owns the model catalog — no transport/rest
    scheduler/                 # decides node placement — no domain/ of its own (see below)
```

Per-context layout (`chat` shown; `jobs`/`nodes`/`models` are the same
shape minus `transport/rest`):

```
contexts/<context>/
  <context>.module.ts          # named provider arrays (COMMAND_HANDLERS, INFRASTRUCTURE_*, REST_CONTROLLERS), spread into @Module
  domain/
    aggregates/                # <name>.aggregate.ts — identity + lifecycle this context owns
    value-objects/             # one folder per VO: <name>/<name>.value-object.ts
    enums/                     # backing enums for EnumValueObject subclasses
    exceptions/                # typed domain errors (e.g. ModelNotFoundException, JobNotFoundException)
    repositories/              # <name>.repository.ts — Symbol token + interface for THIS context's OWN persistence
  application/
    commands/<name>/           # one folder per command: <name>.command.ts (Input+Command) + <name>.handler.ts (+.spec.ts)
    queries/<name>/            # same shape, for reads
    ports/                     # <name>.port.ts — Symbol token + interface per OTHER context this one calls (chat/scheduler only)
    dtos/                      # cross-context-safe read shapes a command/query returns (e.g. JobSnapshot) — jobs only
  infrastructure/
    repositories/              # in-memory implementations of this context's own repository (v0 only — see above)
    adapters/                  # implementations of this context's ports, dispatching into another context's Command/QueryBus (chat/scheduler only)
  transport/                   # chat only
    rest/
      controllers/
      dtos/
    exceptions/                # <context>-exception.filter.ts — resolve<Context>ExceptionStatus(), registered in core's filter
```

**`ports/` vs. `repositories/`** — don't confuse these, they solve
different problems:
- A **repository** (`domain/repositories/` + `infrastructure/repositories/`)
  is how a context persists **its own** aggregate. `jobs` has one (for
  `Job`); `chat` doesn't have one at all, because `chat` has no
  aggregate of its own to persist.
- A **port** (`application/ports/` + `infrastructure/adapters/`) is how
  a context reaches **another** context. `chat` has four (jobs,
  scheduler, nodes, models); `scheduler` has one (nodes); `jobs`/`nodes`/
  `models` have none, because nothing in v0 needs them to call anyone
  else.

### Where does X go?

- **A new use case (write)** → `contexts/<context>/application/commands/<name>/`:
  - `<name>.command.ts` holds BOTH `<Name>CommandInput` (an `interface`,
    primitive fields only — no validation, no value objects: it's the
    payload transport, or a calling context's adapter, hands the
    command, nothing more) and `<Name>Command` (a `class` whose
    constructor takes the Input and builds value objects from its
    primitives — **this is where validation actually happens**; a
    handler only ever sees an already-valid Command). This mirrors
    `gardenia-api` exactly (see `create-harvest.command.ts`,
    `login-account.command.ts`) — don't invent a separate `*Result`
    class for the command's own shape; there is no such convention there.
  - `<name>.handler.ts` holds `<Name>CommandHandler`
    (`@CommandHandler(<Name>Command)`, `implements ICommandHandler<Command, ReturnType>`
    from `@nestjs/cqrs`). `ReturnType` is whatever the use case actually
    returns — an inline type, a small exported interface next to the
    handler class (see `CreateChatCompletionResult` in
    `create-chat-completion.handler.ts`), or (jobs only) a shared DTO
    in `application/dtos/` when several handlers in the same context
    return the same shape (see `JobSnapshot`). Same rule either way:
    return a snapshot/primitive, never the aggregate instance itself —
    see `toJobSnapshot()` and jobs' handlers for the pattern. Extend
    `BaseCommandHandler` from nestjs-kit **only** if the handler
    actually publishes domain events off a real `AggregateRoot` — none
    of nexora-api's use cases do yet.
- **A new use case (read)** → same shape under `application/queries/<name>/`,
  `<name>.query.ts` (Input+Query) + `<name>.handler.ts`
  (`@QueryHandler`, `implements IQueryHandler<Query, ReturnType>`). See
  `models/application/queries/resolve-model/` or
  `nodes/application/queries/find-available-node/`.
- **A call to another bounded context** → a port: interface + `Symbol`
  token in `application/ports/<name>.port.ts` (primitives/this
  context's own value objects only in the signature — never the other
  context's aggregate or DTO types), implemented by an adapter in
  `infrastructure/adapters/<name>.adapter.ts` that dispatches a
  `Command`/`Query` via the injected `CommandBus`/`QueryBus` and maps
  the result onto the port's own shape. Bind it in the module's
  provider array with `{ provide: TOKEN, useClass: Adapter }` —
  `useClass`, never `useExisting`. See "Five bounded contexts" above
  for the full reasoning, and `chat/application/ports/jobs.port.ts` +
  `chat/infrastructure/adapters/jobs.adapter.ts` for the reference pair.
- **Persistence for a context's own aggregate** → a repository:
  interface + `Symbol` token in `domain/repositories/<name>.repository.ts`,
  implemented in `infrastructure/repositories/in-memory-<name>.repository.ts`
  until the context has a real database. Not the same thing as a port
  — see the distinction above.
- **A validated primitive with construction rules** → `domain/value-objects/<kebab-name>/<kebab-name>.value-object.ts`,
  class `<Name>ValueObject`, extending nestjs-kit's `StringValueObject`
  for a constrained string, `EnumValueObject<typeof SomeEnum>` for a
  closed set of values (with the backing `enum` in `domain/enums/`), or
  `ValueObject<T>` directly for a composite (multi-field) VO — see
  `MessageValueObject`/`RequestValueObject`/`ResultValueObject` for that
  last shape. Never a bare `VO` suffix, never a bare interface with no
  validation.
- **Something with identity and a lifecycle that THIS context owns** →
  `domain/aggregates/<name>.aggregate.ts`, class `<Name>Aggregate`. If
  you're modeling something another context owns (a job, from inside
  `chat`, say), it doesn't belong in `domain/aggregates/` at all — it
  belongs behind a port, as a primitive or a tiny reference shape (see
  `JobRef` in `chat/application/ports/jobs.port.ts`). None of this
  repo's aggregates extend nestjs-kit's `BaseAggregate` yet — that base
  is for event-sourced aggregates with uncommitted domain events, and
  nothing here is persisted for real or emits events yet.
- **A domain-specific failure** → a typed exception in `domain/exceptions/`,
  extending nestjs-kit's `BaseException` directly (see
  `ModelNotFoundException`, `JobNotFoundException`). Register its HTTP
  status in the context's `transport/exceptions/<context>-exception.filter.ts`
  resolver function, added to `core/filters/base-exception.filter.ts`'s
  `EXCEPTION_STATUS_RESOLVERS` — don't hardcode a status in a controller
  or handler. A context with no domain exceptions of its own (`chat`,
  today) doesn't need this file at all.
- **A new bounded context** → new folder under `contexts/` with the
  layout above, registered in `contexts/contexts.module.ts`. Give it a
  `transport/` only if it needs its own public surface — most won't
  (see "Why each non-chat context has no REST controller").
- **Anything cross-cutting to every context** → `core/`. Don't put
  context-specific logic in `core/` and don't put shared plumbing inside
  a context.

## Errors

`core/filters/base-exception.filter.ts` is the single place that maps an
exception to an HTTP status + nexora-api's public error shape
(`{ error: { message, type } }`, OpenAI-compatible — this is nexora-api's
own public contract, not a NestJS/gardenia-api convention, so don't swap
it for Nest's default `{ statusCode, message, error }` shape). Unlike
`nestjs-template`'s filter (`@Catch(BaseException)` only), nexora-api's
catches everything (`@Catch()`): any unexpected error must still produce
this envelope, not Nest's default one. A `BaseException` resolves to a
status via `EXCEPTION_STATUS_RESOLVERS` (one resolver per context that
has domain exceptions — currently jobs, nodes, models; defaults to 400
if none claims it); anything else is a real bug and stays a 500.

Exceptions from jobs/nodes/models propagate through `@nestjs/cqrs`'s
`CommandBus.execute()`/`QueryBus.execute()` unchanged, all the way up
through chat's adapter and handler to the filter — nothing in between
catches and rewraps them. Don't add a try/catch in an adapter or handler
just to log-and-rethrow; if a step needs to react to a specific
failure (see `CreateChatCompletionCommandHandler`'s `markFailed` calls),
catch narrowly for that reason only, and always rethrow.

There's no global `class-validator`-decorated DTO validation in v0
(`ValidationPipe` is wired with `transform: true` only, for the
`@Body()` → real class instance step — not `whitelist`). All actual
validation happens once, in each Command/Query's constructor, via value
objects. If a DTO field ever needs HTTP-layer validation before it even
reaches a Command (e.g. pagination bounds), add `class-validator`
decorators to that one DTO — it doesn't require turning on `whitelist`/
`forbidNonWhitelisted` globally.

## Testing

- Unit tests are co-located: `<name>.handler.spec.ts` next to
  `<name>.handler.ts`.
- No mocking framework, no `@nestjs/testing` in unit tests (see
  `.eslintrc.js`'s `no-restricted-imports` override) — manual
  instantiation only, `new X(...)` instead of DI.
- A handler test that stays inside one context (jobs, nodes, models,
  scheduler) constructs the real `infrastructure/repositories`/`adapters`
  fixtures, exactly like production wiring does. A test for a context
  that *calls* another one (chat, scheduler) fakes that context's own
  port interface instead (see `create-chat-completion.handler.spec.ts`'s
  `FakeJobsPort`/`FakeModelsPort`/etc.) — it must not import the other
  context's domain/application to do so (that's the same boundary rule
  `pnpm run lint` enforces on production code, and it catches this in
  tests too).
- Every new command/query handler needs at least: one test for the
  success path, one for each distinct failure path that maps to a
  different HTTP status.
- `pnpm test` runs everything. There's no integration or E2E layer yet —
  nothing here has a real external dependency to integrate against
  until the other services exist as separate deployables.

## Before opening a PR

```bash
pnpm run lint
pnpm test
pnpm run build
```

There's no CI wired up yet to enforce this automatically.

## Style

- Prettier + ESLint `--fix` are non-negotiable — `pnpm run lint` before
  committing.
- Comments explain *why*, not *what*. Don't write a comment that just
  restates the method signature in prose.
- Everything — code, comments, commit messages, docs — is written in
  English, regardless of what language the conversation with an agent
  happens in.
