#!/bin/bash
# Database restore script - Rollback to a backup
# Usage: ./scripts/db-restore.sh [backup_file]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DB_FILE="$PROJECT_ROOT/oro.db"
BACKUP_DIR="$PROJECT_ROOT/backups"

# If no backup file specified, show list
if [ -z "$1" ]; then
    echo "📋 Available backups:"
    echo "===================="
    ls -lth "$BACKUP_DIR"/oro_backup_*.db 2>/dev/null || echo "No backups found"
    echo ""
    echo "Usage: $0 <backup_file>"
    echo "Example: $0 backups/oro_backup_20250118_120000.db"
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Error: Backup file not found: $BACKUP_FILE"
    exit 1
fi

# Confirm restore
echo "⚠️  Warning: This will replace your current database!"
echo "Current database: $DB_FILE"
echo "Restore from: $BACKUP_FILE"
read -p "Are you sure? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Restore cancelled"
    exit 0
fi

# Backup current database before restoring (just in case)
if [ -f "$DB_FILE" ]; then
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    SAFETY_BACKUP="$BACKUP_DIR/oro_before_restore_$TIMESTAMP.db"
    echo "📦 Creating safety backup of current database..."
    cp "$DB_FILE" "$SAFETY_BACKUP"
    echo "✅ Safety backup created: $SAFETY_BACKUP"
fi

# Restore backup
echo "🔄 Restoring database..."
cp "$BACKUP_FILE" "$DB_FILE"
echo "✅ Database restored successfully!"
