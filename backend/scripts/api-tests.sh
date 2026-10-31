#!/usr/bin/env bash
# Starts the built server on a test port and runs the Bruno collection against it.
set -euo pipefail
cd "$(dirname "$0")/.."
PORT=3100 node dist/index.js &
SERVER_PID=$!
trap 'kill $SERVER_PID' EXIT
# The server starts asynchronously, so poll until it accepts requests (up to ~5s)
# instead of racing the first request. Fail loudly if it never comes up.
curl -sf -o /dev/null --retry 50 --retry-delay 1 --retry-connrefused "http://localhost:3100/todos"
cd bruno
bunx bru run --env local
