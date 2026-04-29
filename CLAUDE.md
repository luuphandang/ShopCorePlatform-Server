# ShopCore Server — Claude/Dev Onboarding

Backend NestJS API for ShopCorePlatform. Listens on **port 3670** (GraphQL at `/graphql`).

## Stack

- **Runtime:** Node.js LTS (see [.nvmrc](.nvmrc))
- **Framework:** NestJS 10 + TypeScript 5
- **API:** GraphQL (Apollo Server, code-first via `@nestjs/graphql`)
- **Database:** PostgreSQL 15 + TypeORM 0.3
- **Cache / pub-sub:** Redis (ioredis)
- **Async messaging:** RabbitMQ (`amqp-connection-manager`)
- **Auth:** Passport JWT (RS256) + bcrypt
- **Security:** helmet, sanitize-html, graphql-depth-limit, graphql-query-complexity, throttler

## Layout

- `src/main.ts` — bootstrap (helmet, CORS, cookie-parser, validation pipe, etc.)
- `src/app.module.ts` — root DI module
- `src/common/` — cross-cutting:
  - `configs/` — TypeORM, GraphQL, JWT, Redis, RabbitMQ
  - `guards/` — `passport-auth.guard`, `csrf.guard`
  - `decorators/`, `interceptors/`, `filters/`, `middlewares/`
  - `logger/`, `redis/`, `rabbitmq/`
  - `dataloader/` — DataLoader-per-request batching
  - `security/`, `helpers/`, `utils/`, `abstracts/`
- `src/modules/<domain>/` — feature module per bounded context
  - `<domain>.module.ts`, `.resolver.ts`, `.service.ts`, `.repository.ts`
  - `inputs/` — GraphQL input DTOs (class-validator)
  - `entities/` — TypeORM entities
- `src/database/migrations/structure/` — schema migrations
- `src/database/migrations/data/` — data migrations
- `src/docker/{postgresql,rabbitmq,redis}/` — local infra compose files
- `src/schema.gql` — generated GraphQL SDL

## Common commands

| Command                                     | Purpose                                  |
| ------------------------------------------- | ---------------------------------------- |
| `npm run start:dev`                         | Watch mode (sets `NODE_ENV=development`) |
| `npm run start:prod`                        | Run compiled `dist/main`                 |
| `npm run start:production`                  | PM2 via `ecosystem.config.js`            |
| `npm test`                                  | Jest unit                                |
| `npm run test:cov`                          | Coverage                                 |
| `npm run test:e2e`                          | End-to-end (`test/jest-e2e.json`)        |
| `npm run lint`                              | ESLint --fix                             |
| `npm run build`                             | Compile to `dist/`                       |
| `bash server.sh database backup`            | `pg_dump` (requires `PGPASSWORD`)        |
| `FILE_NAME=AddX npm run migration:create`   | Create empty structure migration         |
| `FILE_NAME=AddX npm run migration:generate` | Auto-diff entity vs DB → migration       |
| `npm run migration:run`                     | Run pending migrations                   |
| `npm run migration:revert`                  | Revert last migration                    |

## Convention

- Files: `kebab-case.ts`. Classes: `PascalCase`. Variables/functions: `camelCase`.
- Entity: `<name>.entity.ts`. Repository extends `AbstractRepository<TEntity>`.
- Resolver mutations take a single DTO arg: `@Args('input') input: CreateXInput`.
- Permissions: `@UseAuthGuard([PERMISSIONS.X_Y])`. See [src/common/guards/passport-auth.guard.ts](src/common/guards/passport-auth.guard.ts) for semantics.
- Imports: TS path alias `@/` resolves to `src/` (tsconfig + jest moduleNameMapper).

## Adding a module

1. Scaffold under `src/modules/<name>/`.
2. Register the new `XModule` in `app.module.ts` `imports`.
3. Add the entity, generate a migration (`migration:generate`), run it on dev.
4. Write tests alongside the service/resolver.

## Async messaging

- Publisher helper: `service.abstract.ts:publishEvent('<domain>.<event>.v1', payload)`.
- Connection: `amqp-connection-manager` via `RABBITMQ_URI`.
- Consumer wiring is sparse today — see future task #43 for DLX/retry handling.

## Health & observability

- Health endpoints: `GET /health/liveness`, `GET /health/readiness` (planned in task #13).
- Logs: Winston JSON, daily rotation under `logs/`.
- Metrics: `GET /metrics` Prometheus (planned in task #20).
- Trace correlation: `x-request-id` header propagation (planned in task #14).

## Database & migrations

- **Production safety:** [src/common/configs/typeorm.config.ts](src/common/configs/typeorm.config.ts) throws on `NODE_ENV=production` + `DB_SYNCHRONIZE=true` and forces `synchronize: false` regardless of env in production. Always use migrations in non-dev environments.
- Test migrations on staging before prod.
- When changing schema:
  1. Update entity.
  2. `FILE_NAME=DescribeChange npm run migration:generate` and review the generated `*.ts`.
  3. `npm run migration:run` on dev.
  4. Commit entity + migration in the same change.

## Local infrastructure

```bash
docker compose -f src/docker/postgresql/docker-compose.yml up -d
docker compose -f src/docker/redis/docker-compose.yml up -d
docker compose -f src/docker/rabbitmq/docker-compose.yml up -d
```

## Build production image

Multi-stage Dockerfile produces a non-root `node:20-alpine` runtime image (~250MB) with `dumb-init` PID 1 so SIGTERM reaches Nest and the graceful-shutdown hook fires. Migrations are NOT run in `CMD` — invoke them separately at deploy time.

```bash
docker build -t shopcore-server:<tag> .
docker run --rm -p 3670:3670 \
  -e DB_HOST=... -e DB_USER=... -e DB_PASSWORD=... -e DB_NAME=... \
  -e RABBITMQ_URI=... -e REDIS_HOST=... \
  -e JWT_ACCESS_PUBLIC_KEY=... -e JWT_ACCESS_PRIVATE_KEY=... \
  shopcore-server:<tag>
```

Healthcheck hits `GET /health/liveness` every 30s (start period 30s).

Postgres uses a named volume (`postgres_database`) so data survives restarts.

## Release notes pointers

Full release runbook: [.claude/plan/production-release-plan.md](../.claude/plan/production-release-plan.md). Task index: [.claude/plan/task/README.md](../.claude/plan/task/README.md).
