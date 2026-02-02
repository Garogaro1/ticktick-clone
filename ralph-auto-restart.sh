#!/bin/bash
# Ralph Auto-Restart Loop
# Automatically restarts when Claude API rate limits hit

set -euo pipefail

MAX_RESTARTS=100
RESTART_COUNT=0
RESTART_DELAY=300  # 5 minutes between restart attempts

cd /c/AITEST/ticktick-clone

while [ $RESTART_COUNT -lt $MAX_RESTARTS ]; do
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🤖 Ralph Auto-Restart Loop"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "Restart #$RESTART_COUNT"
  echo "Started: $(date)"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""

  # Run Ralph
  if bash ralph-loop.sh build; then
    echo "✅ Ralph completed successfully!"
    break
  else
    EXIT_CODE=$?
    echo "❌ Ralph stopped with exit code: $EXIT_CODE"
    RESTART_COUNT=$((RESTART_COUNT + 1))

    if [ $RESTART_COUNT -lt $MAX_RESTARTS ]; then
      echo "⏳ Waiting ${RESTART_DELAY}s before restart..."
      echo "   Restarting at: $(date -d "+${RESTART_DELAY}seconds" 2>/dev/null || date)"
      sleep $RESTART_DELAY
    fi
  fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $RESTART_COUNT -eq $MAX_RESTARTS ]; then
  echo "❌ Max restarts reached ($MAX_RESTARTS)"
else
  echo "✅ Ralph loop finished"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
