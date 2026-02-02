#!/bin/bash
# Ralph Universal Loop Script
# Works for ANY project with Ralph setup

set -euo pipefail

# Usage:
#   ./ralph-loop.sh              # Build mode (default)
#   ./ralph-loop.sh plan         # Plan mode
#   ./ralph-loop.sh build 20     # Build mode, max 20 iterations
#   ./ralph-loop.sh validate     # Run validation only

# Parse arguments
MODE="build"
MAX_ITERATIONS=0
PROMPT_FILE="PROMPT_build.md"

case "${1:-}" in
  plan)
    MODE="plan"
    PROMPT_FILE="PROMPT_plan.md"
    MAX_ITERATIONS=${2:-5}
    ;;
  build)
    MODE="build"
    PROMPT_FILE="PROMPT_build.md"
    MAX_ITERATIONS=${2:-0}
    ;;
  validate)
    # Run validation commands from AGENTS.md
    echo "🔍 Running validation..."
    if [ -f ".ralph/validate.sh" ]; then
      bash .ralph/validate.sh
    else
      echo "⚠️  No .ralph/validate.sh found, skipping custom validation"
    fi
    exit $?
    ;;
  *)
    if [[ "$1" =~ ^[0-9]+$ ]]; then
      MAX_ITERATIONS=$1
    else
      echo "❌ Unknown argument: $1"
      echo "Usage: $0 [plan|build|validate] [max-iterations]"
      exit 1
    fi
    ;;
esac

# Check required files
if [ ! -f "$PROMPT_FILE" ]; then
  echo "❌ Error: $PROMPT_FILE not found"
  echo "Run /ralph-setup first to initialize Ralph"
  exit 1
fi

if [ ! -f "AGENTS.md" ]; then
  echo "❌ Error: AGENTS.md not found"
  echo "Run /ralph-setup first to initialize Ralph"
  exit 1
fi

# Create .ralph directory
mkdir -p .ralph

# Setup lock file
LOCK_FILE=".ralph/running.lock"
LOG_FILE=".ralph/loop.log"

# Check if already running
if [ -f "$LOCK_FILE" ]; then
  echo "⚠️  Ralph is already running!"
  echo "Lock file: $LOCK_FILE"
  echo "To stop: rm $LOCK_FILE"
  exit 1
fi

# Create lock
touch "$LOCK_FILE"

# Cleanup function
cleanup() {
  rm -f "$LOCK_FILE"
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "Ralph loop stopped"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

trap cleanup EXIT

# Get current branch
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "no-git")

# Print header
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🤖 Ralph Wiggum Loop"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Mode:   $MODE"
echo "Branch: $CURRENT_BRANCH"
echo "Prompt: $PROMPT_FILE"
[ $MAX_ITERATIONS -gt 0 ] && echo "Max:    $MAX_ITERATIONS iterations"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

ITERATION=0

# Main loop
while true; do
  if [ $MAX_ITERATIONS -gt 0 ] && [ $ITERATION -ge $MAX_ITERATIONS ]; then
    echo "✅ Reached max iterations: $MAX_ITERATIONS"
    break
  fi

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🔄 Iteration $((ITERATION + 1))"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""

  # Log to file
  echo "=== Iteration $((ITERATION + 1)) - $(date) ===" >> "$LOG_FILE"

  # Run Claude Code
  # -p: Headless mode (read from stdin)
  # --dangerously-skip-permissions: Fully automated
  # --output-format stream-json: Structured output
  # --model opus: Best reasoning for task selection
  cat "$PROMPT_FILE" | claude -p \
    --dangerously-skip-permissions \
    --output-format stream-json \
    --model opus \
    --verbose 2>&1 | tee -a "$LOG_FILE"

  # Check if Claude succeeded
  CLAUDE_EXIT=${PIPESTATUS[0]}
  if [ $CLAUDE_EXIT -ne 0 ]; then
    echo "❌ Claude exited with code $CLAUDE_EXIT"
    echo "Check $LOG_FILE for details"
    exit $CLAUDE_EXIT
  fi

  # Push to git if in git repo
  if [ "$CURRENT_BRANCH" != "no-git" ]; then
    echo ""
    echo "📤 Pushing to remote..."
    git push origin "$CURRENT_BRANCH" 2>&1 | tee -a "$LOG_FILE" || {
      echo "⚠️  Push failed, creating remote branch..."
      git push -u origin "$CURRENT_BRANCH" 2>&1 | tee -a "$LOG_FILE"
    }
  fi

  ITERATION=$((ITERATION + 1))
  echo ""
  echo "✅ Iteration $ITERATION complete"
  echo ""
  echo "Waiting 2 seconds before next iteration..."
  sleep 2
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Ralph loop completed successfully!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
