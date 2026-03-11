#!/bin/bash
# =============================================================================
# Script to remove .env.development from git history
# WARNING: This rewrites git history! Only run on a backup or after coordination
#          with all team members. Everyone must re-clone after this.
# =============================================================================
#
# Option 1: Using BFG Repo-Cleaner (recommended, faster)
# Download BFG from: https://rtyley.github.io/bfg-repo-cleaner/
#
# Usage:
#   1. Make a fresh clone: git clone --mirror <repo-url> repo-mirror.git
#   2. Run BFG:
#        java -jar bfg.jar --delete-files .env.development repo-mirror.git
#   3. Clean up:
#        cd repo-mirror.git
#        git reflog expire --expire=now --all
#        git gc --prune=now --aggressive
#   4. Push:
#        git push
#
# =============================================================================
#
# Option 2: Using git filter-repo (modern replacement for filter-branch)
# Install: pip install git-filter-repo
#
# Usage:
#   1. Make a fresh clone: git clone <repo-url> repo-clean
#   2. Run:
#        cd repo-clean
#        git filter-repo --invert-paths --path server/.env.development
#   3. Re-add remote and push:
#        git remote add origin <repo-url>
#        git push --force --all
#
# =============================================================================
#
# IMPORTANT NOTES:
# - Back up the repository before running any of these commands
# - All team members must re-clone after history rewrite
# - Force push will be required
# - This cannot be undone once pushed
# - After cleaning, verify with:
#     git log --all --full-history -- server/.env.development
#   (should return no results)
# =============================================================================

echo "This script contains instructions only. Do NOT execute it directly."
echo "Read the comments above and follow the steps manually."
exit 1
