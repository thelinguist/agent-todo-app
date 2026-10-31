#!/usr/bin/env bash
# Starts the built server on a test port and runs the Bruno collection against it.
set -euo pipefail
cd "$(dirname "$0")/.."
PORT=3100 node dist/index.js &
SERVER_PID=$!
trap 'kill $SERVER_PID' EXIT
for _ in $(seq 1 50); do
  curl -s -o /dev/null "http://localhost:3100/todos" && break
  sleep 0.1
done
cd bruno
bunx bru run --env local
