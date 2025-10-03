## DYHE Platform - Docker Deployment Guide

This guide covers running the platform on Docker (API + Web + Postgres) for local and VPS deployments.

### Prerequisites

- Docker Engine 24+
- Docker Compose V2
- Domain(s) if you plan to expose to internet (optional)

### Services

- API (NestJS + Prisma) at port 8000
- Web (Next.js) at port 3000
- Postgres 16 at port 5432

### Environment Variables

The compose file wires sensible defaults. Update as needed:

- API
  - `DATABASE_URL` (compose uses `postgresql://dyhe:dyhe@db:5432/dyhe?schema=public`)
  - `PORT` (default 8000)
  - `NODE_ENV` (production)
  - `JWT_SECRET` (change this!)
- Web
  - `NEXT_PUBLIC_API_URL` (internal resolves to `http://api:8000`)
  - `PORT` (default 3000)

To override, create a `.env` next to `docker-compose.yml`:

```
JWT_SECRET=your-strong-secret
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

Compose will inject these automatically.

### Build and Run

```
# From repo root
docker compose build
docker compose up -d
```

- Web: http://localhost:3000
- API: http://localhost:8000

The API container runs Prisma migrations at startup via `apps/api/entrypoint.sh` (`prisma migrate deploy`).

### Client-side PDF Label Printing (Mac friendly)

- Labels are generated as 4x6in PDFs in the browser (jsPDF)
- From Packages list or Print page, click Generate PDF Label
- The PDF opens in a new tab; use the Mac system print dialog
- Set paper size to 4" x 6" and fit/actual size as your printer requires
- Works reliably with thermal printers that mis-handle raw HTML

### Logs and Status

```
docker compose ps
docker compose logs -f db
docker compose logs -f api
docker compose logs -f web
```

### Updating

```
# Pull/update code first (git)
docker compose build --no-cache
docker compose up -d
```

### Database Backups (Postgres)

Data is stored in the named volume `db_data`.

- Snapshot: `docker run --rm --network host -e PGPASSWORD=dyhe postgres:16-alpine pg_dump -h 127.0.0.1 -U dyhe -d dyhe > backup.sql`
- Restore: `cat backup.sql | docker exec -i dyhe-db psql -U dyhe -d dyhe`

### Reverse Proxy (Optional)

Use Caddy or Nginx on the VPS to terminate TLS and route to containers.

Example Caddyfile:

```
yourdomain.com {
  reverse_proxy web:3000
}

api.yourdomain.com {
  reverse_proxy api:8000
}
```

Run Caddy in the same compose project or on host; if in compose, set networks accordingly.

### Production Tips

- Set a strong `JWT_SECRET` and keep it outside VCS.
- Restrict Postgres port to internal network only in production (remove `"5432:5432"` publish and connect via network).
- Use a managed volume backup strategy or external Postgres.
- For Next.js, ensure `NEXT_PUBLIC_API_URL` points to your public API domain when exposed externally.

### Troubleshooting

- API cannot connect to DB
  - Check `docker compose logs -f api` and `db`
  - Confirm `DATABASE_URL` is correct
- Prisma migration errors
  - Exec into API and run `npx prisma migrate deploy`
- Web calls still use localhost
  - Ensure `NEXT_PUBLIC_API_URL` is set to `http://api:8000` inside compose, or your public API URL in production
- Ports already in use
  - Change published ports in `docker-compose.yml`

### Commands Cheat Sheet

```
# Start/Stop
docker compose up -d
docker compose down

# Rebuild only API or Web
docker compose build api
docker compose build web

# Enter a shell in a container
docker exec -it dyhe-api sh

# Run Prisma generate (inside API container)
docker exec -it dyhe-api npx prisma generate
```

### File Map (added)

- `.dockerignore`: ignores build artifacts and dotfiles
- `apps/api/Dockerfile`: multi-stage build for NestJS API + Prisma
- `apps/api/entrypoint.sh`: runs `prisma migrate deploy` then boots API
- `apps/web/Dockerfile`: multi-stage build for Next.js
- `docker-compose.yml`: Postgres + API + Web orchestration

If you want, I can add a Caddy/Nginx compose service next so you get HTTPS automatically with your domain.
