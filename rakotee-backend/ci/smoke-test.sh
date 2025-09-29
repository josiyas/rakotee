#!/usr/bin/env bash
set -euo pipefail

# Simple smoke test: poll /health until it returns 200 or timeout
HOST=${1:-http://localhost:5000}
TIMEOUT=${2:-60}
INTERVAL=3
END=$((SECONDS+TIMEOUT))

echo "Waiting for $HOST/health to become healthy (timeout: ${TIMEOUT}s)..."
while [ $SECONDS -lt $END ]; do
  if curl -fsS "$HOST/health" >/dev/null 2>&1; then
    echo "OK: /health returned success"
    exit 0
  fi
  sleep $INTERVAL
done

echo "ERROR: /health did not become healthy within ${TIMEOUT}s"
exit 1
