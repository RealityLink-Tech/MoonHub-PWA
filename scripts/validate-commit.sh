#!/bin/bash
# Validate commit message format
# Format: <emoji> <type>[!][(<scope>)]: <description>

COMMIT_MSG_FILE="$1"
COMMIT_MSG=$(cat "$COMMIT_MSG_FILE")

# Allow merge commits
if echo "$COMMIT_MSG" | grep -qE '^Merge\s+'; then
  exit 0
fi

# Allow "Initial plan" commits (Claude Agent compatibility)
if [[ "$COMMIT_MSG" == "Initial plan" ]]; then
  exit 0
fi

# Emoji + type pattern (use grep for emoji support)
COMMIT_PATTERN='^[📦🔧🗑️🔒⚙️☕🧪📖🚀🔁]\s+(new|update|remove|security|setup|chore|test|docs|release)(\([^)]+\))?!?:\s+.+$'

if ! echo "$COMMIT_MSG" | grep -qE "$COMMIT_PATTERN"; then
  echo ""
  echo "❌ Invalid commit message format!"
  echo ""
  echo "Format: <emoji> <type>[!][(<scope>)]: <description>"
  echo ""
  echo "Valid emojis and types:"
  echo "  📦 new      - New feature"
  echo "  🔧 update   - Update existing feature"
  echo "  🗑️ remove   - Remove code/feature"
  echo "  🔒 security - Security fix"
  echo "  ⚙️ setup    - Setup/configuration"
  echo "  ☕ chore    - Maintenance task"
  echo "  🧪 test     - Test related"
  echo "  📖 docs     - Documentation"
  echo "  🚀 release  - Release"
  echo ""
  echo "Examples:"
  echo "  📦 new: add user authentication"
  echo "  🔧 update(chat): improve message rendering"
  echo "  🗑️ remove!: deprecated API endpoints"
  echo ""
  exit 1
fi

exit 0
