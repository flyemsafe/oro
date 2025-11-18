#!/bin/bash
# Database backup script - Run before every migration
# This ensures you can rollback if something goes wrong

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DB_FILE="$PROJECT_ROOT/oro.db"
BACKUP_DIR="$PROJECT_ROOT/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/oro_backup_$TIMESTAMP.db"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Check if database exists
if [ ! -f "$DB_FILE" ]; then
    echo "✅ No database file found at $DB_FILE (this is normal for first run)"
    exit 0
fi

# Create backup
echo "📦 Backing up database..."
cp "$DB_FILE" "$BACKUP_FILE"
echo "✅ Database backed up to: $BACKUP_FILE"

# Keep only last 10 backups
echo "🧹 Cleaning old backups (keeping last 10)..."
ls -t "$BACKUP_DIR"/oro_backup_*.db | tail -n +11 | xargs -r rm
echo "✅ Backup complete!"
