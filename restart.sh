#!/bin/bash
###############################################################################
# OSINT Toolkit — restart.sh
#
# Restarts the Docker container WITHOUT rebuilding.
# Use this when you've updated the source files on disk and want the
# container to pick them up (requires a volume mount, see docker-compose.yml).
#
# For a full rebuild (new dependencies, Dockerfile changes), use deploy.sh
###############################################################################

set -e
cd "$(dirname "$0")"

echo "→ Restarting container..."
docker compose restart osint-toolkit 2>/dev/null || docker-compose restart osint-toolkit
echo ""
echo "✅ Container restarted. App: http://localhost:3000"
