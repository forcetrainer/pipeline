#!/usr/bin/env bash
# ===========================================
# Backup PROD database
# ===========================================
# Uses sqlite3 .backup for a consistent snapshot (safe even while app is running).
# Backups are stored in ./backups/ with timestamps.
# Keeps the last 30 backups.
#
# Usage:
#   ./scripts/backup.sh

set -euo pipefail
cd "$(dirname "$0")/.."

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/pipeline_${TIMESTAMP}.db"

mkdir -p "$BACKUP_DIR"

echo "=== PROD Database Backup ==="

# Use docker exec to run sqlite3 backup inside the container
# This ensures a consistent snapshot even while the app is running
if ! docker ps --format '{{.Names}}' | grep -q 'pipeline-prod'; then
  echo "  PROD container is not running. Attempting volume-level backup..."

  # Fallback: mount the volume directly and copy
  docker run --rm \
    -v pipeline-prod-data:/data:ro \
    -v "$(pwd)/backups:/backups" \
    alpine:3.19 sh -c "
      apk add --no-cache sqlite > /dev/null 2>&1
      if [ -f /data/pipeline.db ]; then
        sqlite3 /data/pipeline.db \".backup '/backups/pipeline_${TIMESTAMP}.db'\"
        echo 'Backup created.'
      else
        echo 'ERROR: No database found in prod volume.'
        exit 1
      fi
    "
else
  # Preferred: backup via the running container's volume
  docker run --rm \
    -v pipeline-prod-data:/data:ro \
    -v "$(pwd)/backups:/backups" \
    alpine:3.19 sh -c "
      apk add --no-cache sqlite > /dev/null 2>&1
      sqlite3 /data/pipeline.db \".backup '/backups/pipeline_${TIMESTAMP}.db'\"
    "
fi

# Verify backup
if [ -f "$BACKUP_FILE" ]; then
  SIZE=$(ls -lh "$BACKUP_FILE" | awk '{print $5}')
  echo "  Created: $BACKUP_FILE ($SIZE)"
else
  echo "  ERROR: Backup file was not created."
  exit 1
fi

# Cleanup old backups (keep last 30)
TOTAL=$(ls -1 "$BACKUP_DIR"/pipeline_*.db 2>/dev/null | wc -l | tr -d ' ')
if [ "$TOTAL" -gt 30 ]; then
  REMOVE=$((TOTAL - 30))
  ls -1t "$BACKUP_DIR"/pipeline_*.db | tail -n "$REMOVE" | xargs rm -f
  echo "  Cleaned up $REMOVE old backup(s). $((TOTAL - REMOVE)) retained."
else
  echo "  Total backups: $TOTAL"
fi

echo "=== Backup complete ==="
