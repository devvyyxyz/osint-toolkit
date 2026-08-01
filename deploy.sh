#!/bin/bash
###############################################################################
# OSINT Toolkit — deploy.sh
#
# Pulls the latest source files and rebuilds the Docker container.
# Run this every time you want to update to the latest version.
#
# Usage:
#   ./deploy.sh          # pull + rebuild + restart
#   ./deploy.sh --no-pull # rebuild + restart without git pull (for local edits)
#
# Works on UGNAS, any Linux, or macOS.
###############################################################################

set -e

cd "$(dirname "$0")"

BUILD_DATE=$(date -u +%Y-%m-%dT%H:%M:%SZ)
echo "=========================================="
echo "  OSINT Toolkit — Deploy"
echo "  Build date: ${BUILD_DATE}"
echo "=========================================="
echo ""

# Step 1: Pull latest code (skip with --no-pull)
if [ "$1" != "--no-pull" ]; then
  if [ -d ".git" ]; then
    echo "→ Pulling latest code from git..."
    git pull --rebase || {
      echo "⚠️  Git pull failed. Continuing with current files."
    }
    echo ""
  else
    echo "ℹ️  Not a git repo. Using current files."
    echo ""
  fi
fi

# Step 2: Rebuild the Docker image with a fresh BUILD_DATE
# This forces Docker to pick up the latest source files even if
# the COPY layer appears cached.
echo "→ Building Docker image (cache-busted via BUILD_DATE)..."
docker compose build \
  --build-arg BUILD_DATE="${BUILD_DATE}" \
  || docker-compose build \
    --build-arg BUILD_DATE="${BUILD_DATE}"
echo ""

# Step 3: Restart the container with the new image
echo "→ Restarting container..."
docker compose up -d \
  || docker-compose up -d
echo ""

# Step 4: Clean up old images (optional)
echo "→ Cleaning up dangling images..."
docker image prune -f 2>/dev/null || true
echo ""

echo "=========================================="
echo "  ✅ Deploy complete!"
echo "  App: http://localhost:3000"
echo "  Logs: docker compose logs -f"
echo "=========================================="
