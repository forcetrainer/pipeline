#!/usr/bin/env bash
# ===========================================
# Deploy to DEV container
# ===========================================
# Usage:
#   ./scripts/deploy-dev.sh            # uses :latest
#   ./scripts/deploy-dev.sh 20260309   # uses specific tag

set -euo pipefail
cd "$(dirname "$0")/.."

TAG="${1:-latest}"

echo "=== Deploying to DEV ==="
echo "    Image tag: pipeline:$TAG"

export IMAGE_TAG="$TAG"

# Source .env if it exists
if [ -f .env ]; then
  set -a; source .env; set +a
fi

# Only bring up the dev service
docker compose up -d dev

echo ""
echo "=== DEV deployed ==="
echo "    URL: http://localhost:3001"
echo ""
echo "Waiting for health check..."
for i in $(seq 1 30); do
  if curl -sf http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "    DEV is healthy!"
    exit 0
  fi
  sleep 1
done

echo "    WARNING: Health check did not pass within 30s. Check logs:"
echo "    docker compose logs dev"
exit 1
