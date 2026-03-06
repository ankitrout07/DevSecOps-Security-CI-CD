#!/bin/bash

# Simple script to test traffic shifting
# Usage: ./test-traffic.sh <service-url>

URL=${1:-"http://localhost:8080"}

echo "Testing traffic at $URL..."
echo "Press Ctrl+C to stop"

while true; do
  RESPONSE=$(curl -s $URL)
  ENV=$(echo "$RESPONSE" | grep -oP '(?<=<div class="status-badge">).*?(?= ENVIRONMENT</div>)')
  if [ -z "$ENV" ]; then
    echo "Error: Could not determine environment from response"
  else
    echo "$(date +%H:%M:%S) - Current Environment: $ENV"
  fi
  sleep 1
done
