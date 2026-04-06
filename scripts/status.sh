#!/usr/bin/env bash
# ===========================================
# Show status of all Pipeline services
# ===========================================

set -euo pipefail
cd "$(dirname "$0")/.."

echo "=== Pipeline Status ==="
echo ""

# Container status
echo "Containers:"
docker compose ps 2>/dev/null || echo "  Docker Compose not running"

echo ""

# Health checks
echo "Health:"
DEV_HEALTH=$(curl -sf http://localhost:3001/api/health 2>/dev/null && echo "healthy" || echo "unreachable")
PROD_HEALTH=$(curl -sf http://localhost:3000/api/health 2>/dev/null && echo "healthy" || echo "unreachable")
echo "  DEV  (http://localhost:3001): $DEV_HEALTH"
echo "  PROD (http://localhost:3000): $PROD_HEALTH"

echo ""

# Image info
echo "Images:"
DEV_IMAGE=$(docker inspect pipeline-dev --format='{{.Config.Image}}' 2>/dev/null || echo "not running")
PROD_IMAGE=$(docker inspect pipeline-prod --format='{{.Config.Image}}' 2>/dev/null || echo "not running")
echo "  DEV:  $DEV_IMAGE"
echo "  PROD: $PROD_IMAGE"

echo ""

# Backups
BACKUP_COUNT=$(ls -1 backups/pipeline_*.db 2>/dev/null | wc -l | tr -d ' ')
LATEST_BACKUP=$(ls -1t backups/pipeline_*.db 2>/dev/null | head -1 || echo "none")
echo "Backups:"
echo "  Count:  $BACKUP_COUNT"
echo "  Latest: $LATEST_BACKUP"

echo ""

# Volume sizes
echo "Volumes:"
docker system df -v 2>/dev/null | grep -E "pipeline-(dev|prod)-data" | awk '{print "  " $1 ": " $3}' || echo "  Could not determine volume sizes"
