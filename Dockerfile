# syntax=docker/dockerfile:1
# Multi-arch friendly: builds natively on a Raspberry Pi 5 (linux/arm64) or with `docker buildx`.

FROM node:24-alpine AS base
WORKDIR /app

# ---- Build the TanStack Start app (Nitro node-server output in .output/) ----
FROM base AS build
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Minimal dependencies for the migration script only ----
FROM base AS migrator
COPY package-lock.json ./package-lock.source.json
RUN node -e "const l=require('./package-lock.source.json').packages; console.log(['drizzle-orm','postgres'].map(n => n + '@' + l['node_modules/' + n].version).join(' '))" > packages.txt \
  && echo '{"type":"module"}' > package.json \
  && npm install --omit=dev --ignore-scripts --no-audit --no-fund $(cat packages.txt)

# ---- Runtime image ----
FROM base AS runtime
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000 \
    TZ=Europe/Paris
RUN apk add --no-cache tzdata

COPY --from=migrator --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/.output ./.output
COPY --chown=node:node drizzle ./drizzle
COPY --chown=node:node scripts/migrate.mjs ./scripts/migrate.mjs

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health > /dev/null || exit 1

# Migrations are idempotent: applying them on every start keeps deployments to a single command.
CMD ["sh", "-c", "node scripts/migrate.mjs && exec node .output/server/index.mjs"]
