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
- CQRS via `@nestjs/cqrs` (`CommandBus`, `@CommandHandler`).
- `@sisques-labs/nestjs-kit` for domain primitives: `BaseException`,
  `ValueObject<T>`, `StringValueObject`, `EnumValueObject<T>`,
  `UuidValueObject`, etc. — don't hand-roll a local equivalent of
  anything the kit already provides.
- REST only in v0 (no GraphQL, no MCP — nothing here justifies either
  yet; add them the way `gardenia-api` does, per context, if/when
  nexora-api needs them).
- No database, no message broker, no OpenTelemetry in v0 — nexora-api
  persists nothing of its own (see "What's deliberately not here" below).
- Testing: Jest, unit tests co-located as `*.spec.ts`. No `@nestjs/testing`
  in unit tests — manual instantiation only (enforced by `.eslintrc.js`).
- Linting: ESLint (`@typescript-eslint` + `eslint-plugin-boundaries` for
  cross-context import enforcement), Prettier, Husky + lint-staged.
- Commits: [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`, ...). No AI attribution in commit messages or PR descriptions.

## What's deliberately not here (yet)

`nestjs-template` ships TypeORM/Postgres, Kafka, OpenTelemetry,
GraphQL+MCP transports, and Winston logging by default. None of that is
wired into nexora-api right now:

- **No persistence.** nexora-api's own root README says it has "no
  business logic of its own" — `nexora-jobs`, `nexora-scheduler`,
  `nexora-nodes` and `nexora-models` own their own state in their own
  repos. Until those exist, `contexts/chat/infrastructure/mock/`
  fakes them in-memory, inside nexora-api's own process.
- **No events/Kafka.** The root README explicitly defers "NATS/eventos"
  past v0. There's no `AggregateRoot`-based aggregate here to publish
  domain events from in the first place — see `JobAggregate`'s docstring.
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
    chat/
      chat.module.ts           # named provider arrays (COMMAND_HANDLERS, INFRASTRUCTURE_GATEWAYS, REST_CONTROLLERS), spread into @Module
      domain/
        aggregates/            # Job/Node/Model — see note below on why these aren't nestjs-kit BaseAggregates
        value-objects/         # one folder per VO: <name>/<name>.value-object.ts
        enums/                 # backing enums for EnumValueObject subclasses
        exceptions/            # typed domain errors (e.g. ModelNotFoundException)
      application/
        commands/<name>/       # one folder per command: <name>.command.ts (Input+Command) + <name>.handler.ts (+.spec.ts)
        ports/                 # <name>.gateway.ts — Symbol token + interface per external dependency
      infrastructure/
        mock/                  # in-memory @Injectable implementations of the ports (v0 only — see above)
      transport/
        rest/
          controllers/
          dtos/
        exceptions/            # <context>-exception.filter.ts — resolve<Context>ExceptionStatus(), registered in core's filter
```

### Where does X go?

- **A new use case (write)** → `contexts/<context>/application/commands/<name>/`:
  - `<name>.command.ts` holds BOTH `<Name>CommandInput` (an `interface`,
    primitive fields only — no validation, no value objects: it's the
    payload transport hands the command, nothing more) and `<Name>Command`
    (a `class` whose constructor takes the Input and builds value
    objects from its primitives — **this is where validation actually
    happens**; a handler only ever sees an already-valid Command). This
    mirrors `gardenia-api` exactly (see `create-harvest.command.ts`,
    `login-account.command.ts`) — don't invent a separate `*Result`
    class for the command's own shape; there is no such convention there.
  - `<name>.handler.ts` holds `<Name>CommandHandler`
    (`@CommandHandler(<Name>Command)`, `implements ICommandHandler<Command, ReturnType>`
    from `@nestjs/cqrs`). `ReturnType` is whatever the use case actually
    returns — an inline type or a small exported interface next to the
    handler class (see `CreateChatCompletionResult` in
    `create-chat-completion.handler.ts`) if it's reused, otherwise
    inline in `execute()`'s signature, same as `gardenia-api`'s
    `LoginAccountCommandHandler` returning `Promise<{ accessToken, refreshToken }>`.
    Extend `BaseCommandHandler` from nestjs-kit **only** if the handler
    actually publishes domain events off a real `AggregateRoot` — none
    of nexora-api's use cases do yet.
- **A new use case (read)** → same shape under `application/queries/<name>/`,
  using `@nestjs/cqrs`'s `QueryBus`/`@QueryHandler` (none yet in nexora-api).
- **A new external dependency** (another Nexora service, a DB, a queue) →
  an interface + `Symbol` token in `application/ports/<name>.gateway.ts`
  (see `jobs.gateway.ts` for the shape), implemented in `infrastructure/`
  (`infrastructure/mock/` until the real thing exists, then e.g.
  `infrastructure/httpclient/`). Bind it in the context module's
  provider array with `{ provide: TOKEN, useClass: Impl }` — `useClass`,
  never `useExisting`, per the cross-repo convention. Application code
  depends on the port, never the concrete implementation.
- **A validated primitive with construction rules** → `domain/value-objects/<kebab-name>/<kebab-name>.value-object.ts`,
  class `<Name>ValueObject`, extending nestjs-kit's `StringValueObject`
  for a constrained string, `EnumValueObject<typeof SomeEnum>` for a
  closed set of values (with the backing `enum` in `domain/enums/`), or
  `ValueObject<T>` directly for a composite (multi-field) VO — see
  `MessageValueObject`/`RequestValueObject`/`ResultValueObject` for that
  last shape. Never a bare `VO` suffix, never a bare interface with no
  validation.
- **Something with identity and a lifecycle** → `domain/aggregates/<name>.aggregate.ts`,
  class `<Name>Aggregate`. Job/Node/Model are plain classes here, **not**
  nestjs-kit `BaseAggregate` subclasses — that base is for event-sourced
  aggregates with uncommitted domain events, and nothing in v0 is
  actually persisted or emits events (their "aggregate" folder placement
  matches `gardenia-api`'s structure; their implementation doesn't need
  to match `gardenia-api`'s event-sourcing machinery until there's a
  real reason to).
- **A domain-specific failure** → a typed exception in `domain/exceptions/`,
  extending nestjs-kit's `BaseException` directly (see
  `ModelNotFoundException`). Register its HTTP status in the context's
  `transport/exceptions/<context>-exception.filter.ts` resolver function
  — don't hardcode a status in a controller or handler.
- **A new bounded context** → new folder under `contexts/` with the same
  four sub-layers, registered in `contexts/contexts.module.ts`.
- **Anything cross-cutting to every context** → `core/`. Don't put
  context-specific logic in `core/` and don't put shared plumbing inside
  a context.

## Cross-context imports

Enforced by `.eslintrc.js`'s `boundaries/element-types` rule (same
config as `nestjs-template`): a bounded context may only import from its
own `src/contexts/<self>/`. Reaching another context's domain/application
is only allowed from `infrastructure/adapters/` (a port implementation
that calls the other context via its `CommandBus`/`QueryBus`, never a
direct import of its internals). Irrelevant with a single context today
— becomes real the moment a second one is added.

## Errors

`core/filters/base-exception.filter.ts` is the single place that maps an
exception to an HTTP status + nexora-api's public error shape
(`{ error: { message, type } }`, OpenAI-compatible — this is nexora-api's
own public contract, not a NestJS/gardenia-api convention, so don't swap
it for Nest's default `{ statusCode, message, error }` shape). Unlike
`nestjs-template`'s filter (`@Catch(BaseException)` only), nexora-api's
catches everything (`@Catch()`): any unexpected error must still produce
this envelope, not Nest's default one. A `BaseException` resolves to a
status via `EXCEPTION_STATUS_RESOLVERS` (defaulting to 400 if no
per-context resolver claims it); anything else is a real bug and stays a
500.

There's no global `class-validator`-decorated DTO validation in v0
(`ValidationPipe` is wired with `transform: true` only, for the
`@Body()` → real class instance step — not `whitelist`). All actual
validation happens once, in each Command's constructor, via value
objects. If a DTO field ever needs HTTP-layer validation before it even
reaches a Command (e.g. pagination bounds), add `class-validator`
decorators to that one DTO — it doesn't require turning on `whitelist`/
`forbidNonWhitelisted` globally.

## Testing

- Unit tests are co-located: `<name>.handler.spec.ts` next to
  `<name>.handler.ts`.
- No mocking framework, no `@nestjs/testing` in unit tests (see
  `.eslintrc.js`'s `no-restricted-imports` override) — construct the
  real `infrastructure/mock` gateways as fixtures, exactly like
  production wiring does, just via `new X()` instead of DI.
- Every new command/query handler needs at least: one test for the
  success path, one for each distinct failure path that maps to a
  different HTTP status.
- `pnpm test` runs everything. There's no integration or E2E layer yet —
  nexora-api has no real external dependency to integrate against until
  the other services exist.

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
