# DYHE Platform

Monorepo for DYHE delivery platform.

- `apps/api`: NestJS + Prisma API
- `apps/web`: Next.js dashboard (client-side PDF label printing)
- `packages/*`: Shared configs and UI

## Requirements

- Node 18+
- pnpm 9 (corepack: `corepack enable && corepack prepare pnpm@9 --activate`)
- Docker (for containerized runs)

## Getting Started (local)

```bash
pnpm install
pnpm dev
```

- Web: http://localhost:3000
- API: http://localhost:8000

## Environment

- API uses Prisma. Set `DATABASE_URL` when running outside Docker
- Web uses `NEXT_PUBLIC_API_URL` for API base URL (defaults to `http://localhost:8000`)

## Scripts

Root (via turbo):

```bash
pnpm dev           # run all dev servers
pnpm build         # build all
pnpm lint          # lint all
pnpm check-types   # typecheck all
```

API:

```bash
cd apps/api
pnpm dev
pnpm build
pnpm start:prod
pnpm db:generate   # prisma generate
pnpm db:migrate    # prisma migrate dev
```

Web:

```bash
cd apps/web
pnpm dev
pnpm build
pnpm start
```

## Docker (local & VPS)

We provide a compose stack for Postgres + API + Web.

```bash
docker compose build
docker compose up -d
```

- Web: http://localhost:3000
- API: http://localhost:8000

API runs `prisma migrate deploy` on startup. Edit `docker-compose.yml` to set secrets like `JWT_SECRET`.

More details: see `DEPLOY_DOCKER.md`.

## PDF Label Printing (Thermal printer friendly)

The app generates 4x6in PDF labels client-side (jsPDF) and opens them in a new tab for printing via macOS system dialog. This avoids thermal printers outputting raw bytes from HTML.

- From the Packages table: use the printer icon → PDF opens → print
- From `/packages/print`: single or bulk → generate PDFs → print
- Printer setup: choose paper size 4" x 6" and appropriate scaling per your device

## Tech Stack

- Web: Next.js 15, React 19, Ant Design 5, React Query
- API: NestJS 11, Prisma 6, PostgreSQL 16
- Monorepo: Turborepo, pnpm workspaces

## Repo Structure

```
apps/
  api/
  web/
packages/
  eslint-config/
  typescript-config/
  ui/
```

## Notes

- Prefer pnpm for package management.
- For production, set strong secrets and consider a reverse proxy (Caddy/Nginx) for TLS.
