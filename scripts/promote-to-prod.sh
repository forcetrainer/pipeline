#!/usr/bin/env bash
# ===========================================
# Promote current DEV build to PROD
# ===========================================
# This script:
#   1. Verifies dev is healthy
#   2. Backs up the prod database
#   3. Updates prod to the same image tag as dev
#
# Usage:
#   ./scripts/promote-to-prod.sh

set -euo pipefail
cd "$(dirname "$0")/.."

echo "=== Promote to PROD ==="

# Source .env if it exists
if [ -f .env ]; then
  set -a; source .env; set +a
fi

# Verify PROD_JWT_SECRET is set
if [ -z "${PROD_JWT_SECRET:-}" ]; then
  echo "ERROR: PROD_JWT_SECRET is not set. Create a .env file from .env.example"
  exit 1
fi

# Step 1: Verify dev is healthy
echo ""
echo "Step 1: Checking DEV health..."
if ! curl -sf http://localhost:3001/api/health > /dev/null 2>&1; then
  echo "  ERROR: DEV is not healthy. Deploy and verify dev first."
  exit 1
fi
echo "  DEV is healthy."

# Step 2: Get the image tag dev is running
DEV_IMAGE=$(docker inspect pipeline-dev --format='{{.Config.Image}}' 2>/dev/null || echo "")
if [ -z "$DEV_IMAGE" ]; then
  echo "  ERROR: Cannot determine DEV image. Is the dev container running?"
  exit 1
fi
echo "  DEV image: $DEV_IMAGE"

# Step 3: Backup prod database before updating
echo ""
echo "Step 2: Backing up PROD database..."
./scripts/backup.sh || echo "  WARNING: Backup failed or no prod DB exists yet (first deploy?)"

# Step 4: Deploy to prod with the same image
echo ""
echo "Step 3: Deploying to PROD..."
export IMAGE_TAG=$(echo "$DEV_IMAGE" | cut -d: -f2)
docker compose up -d prod

echo ""
echo "Waiting for PROD health check..."
for i in $(seq 1 30); do
  if curl -sf http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "  PROD is healthy!"
    echo ""
    echo "=== Promotion complete ==="
    echo "    DEV:  http://localhost:3001"
    echo "    PROD: http://localhost:3000"
    exit 0
  fi
  sleep 1
done

echo "  WARNING: PROD health check did not pass within 30s."
echo "  Check logs: docker compose logs prod"
echo ""
echo "  To rollback: ./scripts/rollback.sh"
exit 1
