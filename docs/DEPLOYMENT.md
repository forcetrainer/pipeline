# Deployment Guide

Pipeline runs dev and prod as separate Docker containers on the same VM, with completely isolated databases.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  VM                                                     │
│                                                         │
│  ┌─────────────────┐       ┌─────────────────┐         │
│  │   DEV (:3001)   │       │  PROD (:3000)   │         │
│  │  pipeline:tag   │       │  pipeline:tag   │         │
│  │                 │       │                 │         │
│  │  Volume:        │       │  Volume:        │         │
│  │  dev-data/      │       │  prod-data/     │         │
│  │  └─pipeline.db  │       │  └─pipeline.db  │         │
│  └─────────────────┘       └─────────────────┘         │
│                                                         │
│  ┌─────────────────┐       ┌─────────────────┐         │
│  │  BACKUP sidecar │──────▶│  ./backups/     │         │
│  │  (daily 2 AM)   │  ro   │  (30 retained)  │         │
│  └─────────────────┘       └─────────────────┘         │
└─────────────────────────────────────────────────────────┘
```

## Key Properties

- **Database isolation**: Dev and prod use completely separate Docker volumes (`pipeline-dev-data` and `pipeline-prod-data`). There is no way for dev to touch the prod database.
- **Same image**: Both containers run the exact same Docker image. Build once, test in dev, promote to prod.
- **Automatic backups**: A sidecar container runs daily backups of the prod database at 2 AM, keeping the last 30.
- **Seed data**: Only runs in non-production mode. Prod starts clean (migrations only).

## Initial Setup

```bash
# 1. Clone the repo on your VM
git clone <repo-url> pipeline
cd pipeline

# 2. Create environment file
cp env.example .env
# Edit .env — set real secrets (especially PROD_JWT_SECRET)

# 3. Build the image
./scripts/build.sh

# 4. Deploy to dev first
./scripts/deploy-dev.sh

# 5. Test dev at http://<vm-ip>:3001
#    - Create an admin account
#    - Verify functionality

# 6. Promote to prod
./scripts/promote-to-prod.sh

# 7. Start the backup sidecar
docker compose up -d backup
```

## Workflow: Deploying a Code Change

```bash
# 1. Pull latest code
git pull

# 2. Build new image
./scripts/build.sh
#    → Creates pipeline:latest and pipeline:YYYYMMDD-HHMMSS

# 3. Deploy to dev
./scripts/deploy-dev.sh
#    → Restarts dev container with new image
#    → Waits for health check

# 4. Test in dev
#    Browse http://<vm-ip>:3001, verify the changes

# 5. Promote to prod
./scripts/promote-to-prod.sh
#    → Verifies dev is healthy
#    → Backs up prod database automatically
#    → Deploys same image to prod
#    → Waits for health check
```

## npm Script Shortcuts

| Command | Description |
|---------|-------------|
| `npm run docker:build` | Build the Docker image |
| `npm run docker:dev` | Deploy to dev container |
| `npm run docker:promote` | Promote dev build to prod |
| `npm run docker:backup` | Manual backup of prod DB |
| `npm run docker:restore` | Restore prod DB from backup |
| `npm run docker:status` | Show status of all services |
| `npm run docker:down` | Stop all containers |
| `npm run docker:logs:dev` | Tail dev container logs |
| `npm run docker:logs:prod` | Tail prod container logs |

## Database Management

### Manual Backup
```bash
./scripts/backup.sh
# Creates: backups/pipeline_YYYYMMDD_HHMMSS.db
```

### Restore from Backup
```bash
# List available backups
./scripts/restore.sh

# Restore a specific backup
./scripts/restore.sh backups/pipeline_20260309_020000.db
# → Stops prod
# → Creates safety backup of current state
# → Restores from selected backup
# → Restarts prod
```

### Automatic Backups
The `backup` sidecar container runs automatically at 2 AM daily. It:
- Creates a consistent SQLite backup (safe while the app is running)
- Retains the last 30 backups
- Logs backup status

```bash
# View backup logs
docker compose logs backup

# Start/stop the backup service
docker compose up -d backup
docker compose stop backup
```

## Creating the First Admin Account (Production)

Since seed data is skipped in production, you need to create an admin account manually on first deploy. The app's login page allows registration. The first user registered will need to be promoted to admin via the database:

```bash
# Connect to prod database
docker exec -it pipeline-prod sh -c "
  apk add --no-cache sqlite
  sqlite3 /app/server/data/pipeline.db \"UPDATE users SET role='admin' WHERE email='your-email@example.com';\"
"
```

## Ports

| Service | Port | URL |
|---------|------|-----|
| Dev | 3001 | `http://<vm-ip>:3001` |
| Prod | 3000 | `http://<vm-ip>:3000` |

## Troubleshooting

```bash
# Check container status and health
./scripts/status.sh

# View logs
docker compose logs dev
docker compose logs prod

# Restart a service
docker compose restart dev
docker compose restart prod

# Full reset of dev (keeps prod safe)
docker compose down dev
docker volume rm pipeline-dev-data
./scripts/deploy-dev.sh
```
