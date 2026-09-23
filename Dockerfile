# =============================================================================
# LinguaClass — Multi-Stage Production Dockerfile for Google Cloud Run
# Monorepo: Turborepo + Next.js Standalone + Prisma ORM
# =============================================================================

# Base stage with Node.js 20 and necessary OS utilities
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Stage 1: Prune monorepo for web app
FROM base AS pruner
RUN npm install -g turbo
COPY . .
RUN turbo prune web --docker

# Stage 2: Install dependencies
FROM base AS deps
WORKDIR /app

# Copy dependency manifests from pruner
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json

# Install dependencies (ignoring scripts initially to avoid premature Prisma generation before schema copy)
RUN npm ci

# Stage 3: Build application
FROM base AS builder
WORKDIR /app

# Copy installed dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=pruner /app/out/full/ .

# Ensure Prisma client is generated with Linux binaries
ENV NODE_ENV=production
RUN npm run db:generate

# Build Next.js application in standalone mode
RUN npm run build -- --filter=web...

# Stage 4: Production Runner (Ultra-lightweight and secure)
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache openssl curl

ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

# Create unprivileged system user and group
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy Next.js standalone server and static assets
# Next.js standalone output mirrors the monorepo structure
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
# Copy public folder if present
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

# Copy Prisma schema and engines for runtime
COPY --from=builder --chown=nextjs:nodejs /app/packages/database/prisma ./packages/database/prisma

USER nextjs

EXPOSE 8080

# Cloud Run healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8080/api/health || exit 1

CMD ["node", "apps/web/server.js"]
