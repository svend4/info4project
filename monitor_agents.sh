#!/bin/bash

# Real-time Agent Monitoring Script
# Check every 3-5 minutes for new commits on feature branches

echo "🎯 COORDINATOR REAL-TIME MONITORING STARTED"
echo "=========================================="
echo ""

# Get latest commits from both branches
echo "📡 Fetching latest commits from origin..."
git fetch origin -q

echo ""
echo "📊 FRONTEND AGENT (feature/frontend-ui) - Latest 3 commits:"
echo "-----------------------------------------------------------"
git log origin/feature/frontend-ui -3 --oneline --no-decorate 2>/dev/null || echo "No commits yet"

echo ""
echo "📊 DEVOPS AGENT (feature/devops) - Latest 3 commits:"
echo "---------------------------------------------------"
git log origin/feature/devops -3 --oneline --no-decorate 2>/dev/null || echo "No commits yet"

echo ""
echo "🔍 STATUS SUMMARY:"
echo "------------------"
echo "Frontend Commits: $(git log origin/feature/frontend-ui --oneline 2>/dev/null | grep -v 'Merge' | wc -l) (excluding merges)"
echo "DevOps Commits: $(git log origin/feature/devops --oneline 2>/dev/null | grep -v 'Merge' | wc -l) (excluding merges)"

echo ""
echo "⏱️  Next check in 3 minutes..."
echo ""
