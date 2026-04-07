# ── Build stage ────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Production stage ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Copia node_modules do builder (inclui tsx, drizzle-kit e outros devDeps)
COPY --from=builder /app/node_modules ./node_modules

# Frontend buildado
COPY --from=builder /app/dist ./dist

# Server source (executado via tsx)
COPY server ./server
COPY tsconfig.json ./
COPY drizzle.config.ts ./
COPY package.json ./

# Pasta de uploads — será sobrescrita pelo volume persistente do Coolify
RUN mkdir -p /app/uploads

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npx", "tsx", "server/index.ts"]
