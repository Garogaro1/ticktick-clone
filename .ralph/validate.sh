#!/bin/bash
# Ralph Validation Script
# Customize this for your project's validation needs

set -euo pipefail

echo "🔍 Running Ralph validation..."
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track failures
FAILURES=0

# Function to run check
run_check() {
  local name="$1"
  local command="$2"

  echo -n "Checking $name... "

  if eval "$command" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
    return 0
  else
    echo -e "${RED}✗${NC}"
    echo -e "${YELLOW}Command: $command${NC}"
    FAILURES=$((FAILURES + 1))
    return 1
  fi
}

# Project-specific checks
run_check "TypeScript" "npm run typecheck"
run_check "Linting" "npm run lint"
run_check "Tests" "npm test"
run_check "Build" "npm run build"

echo ""
if [ $FAILURES -eq 0 ]; then
  echo -e "${GREEN}✓ All validations passed!${NC}"
  exit 0
else
  echo -e "${RED}✗ $FAILURES validation(s) failed${NC}"
  exit 1
fi
