#!/bin/bash
# Ralph Status Checker

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🤖 Ralph Status Monitor"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if Ralph is running
if [ -f .ralph/running.lock ]; then
    echo "✅ Status: RUNNING"
    echo "📅 Started: $(stat -c %y .ralph/running.lock 2>/dev/null || stat -f '%Sm' .ralph/running.lock)"
    echo ""
else
    echo "❌ Status: NOT RUNNING"
    echo ""
fi

# Show progress from IMPLEMENTATION_PLAN.md
echo "📊 Progress:"
grep -E "^- \[[ x]\]" IMPLEMENTATION_PLAN.md | head -20 | wc -l | xargs -I {} echo "  Tasks shown: {}"
echo ""

# Show last 5 commits
echo "📝 Recent Git Commits:"
git log --oneline -5 2>/dev/null || echo "  No commits yet"
echo ""

# Check if package.json exists
if [ -f package.json ]; then
    echo "✅ package.json exists"
    echo "📦 Dependencies: $(cat package.json | jq '.dependencies | length' 2>/dev/null || echo 'N/A')"
else
    echo "⚠️  package.json not created yet"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💾 Full logs: tail -f .ralph/loop.log"
echo "🌐 GitHub: https://github.com/Garogaro1/ticktick-clone"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
