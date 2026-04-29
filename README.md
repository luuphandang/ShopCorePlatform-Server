# ShopCore Server

Backend NestJS API for ShopCorePlatform. See [CLAUDE.md](CLAUDE.md) for the full developer guide.

## Quick start

1. Use the pinned Node version: `nvm use` (see [.nvmrc](.nvmrc)).
2. Install dependencies: `npm ci`.
3. Copy env: `cp .env.example .env.development` and fill in DB / JWT / S3 secrets.
4. Bring up local infrastructure (PostgreSQL + Redis + RabbitMQ):

   ```bash
   docker compose -f src/docker/postgresql/docker-compose.yml up -d
   docker compose -f src/docker/redis/docker-compose.yml up -d
   docker compose -f src/docker/rabbitmq/docker-compose.yml up -d
   ```

5. Run migrations: `npm run migration:run`.
6. Start in watch mode: `npm run start:dev`.
7. GraphQL playground: <http://localhost:3670/graphql>.

## Useful scripts

See [package.json](package.json) and [CLAUDE.md](CLAUDE.md) for the full list (test, lint, migrations, PM2).
