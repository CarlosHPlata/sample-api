# syntax=docker/dockerfile:1

# ── shared base ────────────────────────────────────────────────────────────────
FROM node:24-alpine AS base
WORKDIR /app

# ── every dependency, dev included (cached until package*.json change) ─────────
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ── dev: hot reload, used by docker-compose.yml ────────────────────────────────
FROM deps AS dev
COPY . .
EXPOSE 3000
CMD ["npm", "run", "start:dev"]

# ── build: compile TypeScript, then drop dev dependencies ──────────────────────
FROM deps AS build
COPY . .
RUN npm run build && npm prune --omit=dev

# ── runtime: the image that ships. Last stage = default `docker build` target ──
FROM base AS runtime
ENV NODE_ENV=production \
    PORT=3000
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node package.json ./
USER node
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT}/health" || exit 1
CMD ["node", "dist/main.js"]
