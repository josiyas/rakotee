#!/usr/bin/env bash
set -euo pipefail

BACKEND_URL=${1:-http://localhost:5000}
FRONTEND_URL=${2:-http://localhost:8080}

check() {
  local url=$1
  local expected=${2:-}
  echo "Checking ${url}"
  local body
  body=$(curl -fsS "$url")
  if [[ -n "$expected" ]]; then
    echo "$body" | grep -q "$expected"
  fi
}

check "${BACKEND_URL}/health" '"status":"ok"'

check "${FRONTEND_URL}/index.html" "RAKOTEE"
check "${FRONTEND_URL}/products.html" "Our Products"
check "${FRONTEND_URL}/checkout.html" "Checkout"
check "${FRONTEND_URL}/account.html" "Order History"

echo "Smoke checks passed."
