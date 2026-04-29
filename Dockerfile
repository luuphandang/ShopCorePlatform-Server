# syntax=docker/dockerfile:1.6

# ---------- Stage 1: builder ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Husky's prepare script runs on `npm ci` and expects a .git dir, which is
# excluded from the build context. HUSKY=0 makes it a no-op gracefully.
ENV HUSKY=0

# Toolchain for native module compile (bcrypt).
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci --include=dev

COPY tsconfig*.json nest-cli.json ./
COPY src ./src

RUN npm run build \
    && npm prune --omit=dev \
    && npm cache clean --force

# ---------- Stage 2: runner ----------
FROM node:20-alpine AS runner
WORKDIR /app

# curl: HEALTHCHECK probe. dumb-init: PID 1 + signal forwarding so SIGTERM
# reaches Node and the graceful-shutdown hook (task #15) fires.
RUN apk add --no-cache curl dumb-init \
    && addgroup -S app \
    && adduser -S app -G app

COPY --from=builder --chown=app:app /app/dist ./dist
COPY --from=builder --chown=app:app /app/node_modules ./node_modules
COPY --from=builder --chown=app:app /app/package.json ./

# Winston daily-rotate writes here (task #16). Pre-create writable for non-root.
RUN mkdir -p logs && chown app:app logs

USER app

ENV NODE_ENV=production \
    PORT=3670

EXPOSE 3670

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -fsS http://localhost:3670/health/liveness || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
