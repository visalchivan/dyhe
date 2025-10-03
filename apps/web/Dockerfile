# syntax=docker/dockerfile:1

# 1) Base with pnpm
FROM node:20-alpine AS base
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# 2) Install deps
FROM base AS deps
RUN apk add --no-cache libc6-compat
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages ./packages
COPY apps/web/package.json ./apps/web/package.json
RUN pnpm install --frozen-lockfile --filter web...

# 3) Build
FROM deps AS builder
COPY apps/web ./apps/web
# Next.js build
WORKDIR /app/apps/web
RUN pnpm --filter web build

# 4) Runtime: Next.js standalone
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Copy standalone output if available, else .next
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json
COPY --from=builder /app/packages ./packages

EXPOSE 3000
CMD ["node", "./apps/web/node_modules/next/dist/bin/next", "start", "-p", "3000"]
