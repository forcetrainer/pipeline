#!/usr/bin/env bash
# ===========================================
# Restore PROD database from a backup
# ===========================================
# Usage:
#   ./scripts/restore.sh                          # lists available backups
#   ./scripts/restore.sh backups/pipeline_20260309_020000.db

set -euo pipefail
cd "$(dirname "$0")/.."

BACKUP_DIR="./backups"

# If no argument, list available backups
if [ -z "${1:-}" ]; then
  echo "=== Available Backups ==="
  if ls "$BACKUP_DIR"/pipeline_*.db 1>/dev/null 2>&1; then
    ls -lht "$BACKUP_DIR"/pipeline_*.db | head -20 | awk '{print "  " $NF " (" $5 ", " $6 " " $7 " " $8 ")"}'
    echo ""
    echo "Usage: ./scripts/restore.sh <backup-file>"
  else
    echo "  No backups found in $BACKUP_DIR/"
  fi
  exit 0
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "ERROR: Backup file not found: $BACKUP_FILE"
  exit 1
fi

echo "=== Restore PROD Database ==="
echo "  From: $BACKUP_FILE"
echo ""
echo "  WARNING: This will REPLACE the current prod database."
echo "  The prod container will be stopped during restore."
echo ""
read -p "  Continue? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
  echo "  Aborted."
  exit 0
fi

# Step 1: Stop prod
echo ""
echo "Step 1: Stopping PROD container..."
docker compose stop prod

# Step 2: Backup current state before restoring
echo "Step 2: Creating safety backup of current state..."
SAFETY_TIMESTAMP=$(date +%Y%m%d_%H%M%S)
docker run --rm \
  -v pipeline-prod-data:/data:ro \
  -v "$(pwd)/backups:/backups" \
  alpine:3.19 sh -c "
    apk add --no-cache sqlite > /dev/null 2>&1
    if [ -f /data/pipeline.db ]; then
      sqlite3 /data/pipeline.db \".backup '/backups/pipeline_${SAFETY_TIMESTAMP}_pre-restore.db'\"
      echo 'Safety backup created.'
    fi
  "

# Step 3: Restore from backup
echo "Step 3: Restoring database..."
docker run --rm \
  -v pipeline-prod-data:/data \
  -v "$(pwd)/$BACKUP_FILE:/restore/backup.db:ro" \
  alpine:3.19 sh -c "
    cp /restore/backup.db /data/pipeline.db
    # Remove WAL files to ensure clean state
    rm -f /data/pipeline.db-shm /data/pipeline.db-wal
    chown 1001:1001 /data/pipeline.db
  "

# Step 4: Restart prod
echo "Step 4: Starting PROD container..."
if [ -f .env ]; then
  set -a; source .env; set +a
fi
docker compose up -d prod

echo ""
echo "Waiting for PROD health check..."
for i in $(seq 1 30); do
  if curl -sf http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "  PROD is healthy!"
    echo ""
    echo "=== Restore complete ==="
    echo "  Safety backup: backups/pipeline_${SAFETY_TIMESTAMP}_pre-restore.db"
    exit 0
  fi
  sleep 1
done

echo "  WARNING: PROD health check did not pass. Check logs: docker compose logs prod"
exit 1
