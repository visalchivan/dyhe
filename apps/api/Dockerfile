# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Install OS deps
RUN apk add --no-cache libc6-compat openssl

# Copy monorepo files minimally
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages ./packages

# API workspace
COPY apps/api/package.json ./apps/api/package.json

FROM base AS deps
RUN pnpm install --frozen-lockfile --filter api...

FROM deps AS builder
# Copy sources
COPY apps/api ./apps/api
COPY apps/api/prisma ./apps/api/prisma

# Generate Prisma client inside workspace
WORKDIR /app/apps/api
RUN pnpm --filter api db:generate
# Build NestJS
RUN pnpm --filter api build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# OS deps
RUN apk add --no-cache libc6-compat openssl curl

# Copy built app and node_modules
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/apps/api/generated ./apps/api/generated
COPY --from=builder /app/packages ./packages

# Copy entrypoint
COPY apps/api/entrypoint.sh ./apps/api/entrypoint.sh
RUN chmod +x ./apps/api/entrypoint.sh

EXPOSE 8000
CMD ["./apps/api/entrypoint.sh"]
