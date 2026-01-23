#!/bin/bash

echo "🔧 Fixing issues and pushing to GitHub..."
echo ""

# Check if there are uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo "📝 Committing current changes..."
    git add .
    git commit -m "Fix: NaN error in CapacityTrendChart, add Todoist setup guide, and UI improvements"
    echo "✅ Changes committed"
    echo ""
fi

# Pull remote changes
echo "⬇️  Pulling remote changes..."
git pull origin main

if [ $? -eq 0 ]; then
    echo "✅ Successfully pulled remote changes"
    echo ""
    
    # Push changes
    echo "⬆️  Pushing to GitHub..."
    git push origin main
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "🎉 Successfully pushed to GitHub!"
        echo ""
        echo "✅ All done! Your changes are now on GitHub."
    else
        echo ""
        echo "❌ Push failed. You may have merge conflicts."
        echo "📖 Check GIT_PUSH_FIX.md for help resolving conflicts."
    fi
else
    echo ""
    echo "⚠️  Pull failed. You may have merge conflicts."
    echo "📖 Check GIT_PUSH_FIX.md for help resolving conflicts."
    echo ""
    echo "To resolve conflicts:"
    echo "1. Open conflicted files and resolve them"
    echo "2. Run: git add ."
    echo "3. Run: git commit -m 'Resolve conflicts'"
    echo "4. Run: git push origin main"
fi
