#!/usr/bin/env bash
# Starts the built server on a test port and runs the Bruno collection against it.
# Override the port with API_TEST_PORT if 3100 is already in use.
set -euo pipefail
cd "$(dirname "$0")/.."
API_TEST_PORT="${API_TEST_PORT:-3100}"
BASE_URL="http://localhost:${API_TEST_PORT}"
PORT="$API_TEST_PORT" node dist/index.js &
SERVER_PID=$!
trap 'kill $SERVER_PID' EXIT
# The server starts asynchronously, so poll until it accepts requests (up to ~50s)
# instead of racing the first request. Fail loudly if it never comes up.
curl -sf -o /dev/null --retry 50 --retry-delay 1 --retry-connrefused "$BASE_URL/todos"
cd bruno
bunx bru run --env local --env-var "baseUrl=$BASE_URL"
