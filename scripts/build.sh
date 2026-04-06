#!/usr/bin/env bash
# ===========================================
# Build the Pipeline Docker image
# ===========================================
# Usage:
#   ./scripts/build.sh              # tags as :latest and :YYYYMMDD-HHMMSS
#   ./scripts/build.sh v1.2.3       # also tags as :v1.2.3

set -euo pipefail
cd "$(dirname "$0")/.."

TAG="${1:-}"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
GIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

echo "=== Building Pipeline image ==="
echo "    Git:       $GIT_SHA"
echo "    Timestamp: $TIMESTAMP"

docker build \
  --label "git.sha=$GIT_SHA" \
  --label "build.timestamp=$TIMESTAMP" \
  -t "pipeline:latest" \
  -t "pipeline:$TIMESTAMP" \
  .

if [ -n "$TAG" ]; then
  docker tag "pipeline:latest" "pipeline:$TAG"
  echo "    Tagged:    pipeline:$TAG"
fi

echo ""
echo "=== Build complete ==="
echo "    pipeline:latest"
echo "    pipeline:$TIMESTAMP"

# Write the tag so deploy scripts can reference it
echo "$TIMESTAMP" > .last-build-tag
echo ""
echo "Saved build tag to .last-build-tag"
