#!/bin/bash
# Safe database migration script
# Automatically backs up database before applying migrations

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🔒 Oro Database Migration (with auto-backup)"
echo "============================================="

# Step 1: Backup database
echo ""
echo "Step 1: Creating backup..."
bash "$SCRIPT_DIR/db-backup.sh"

# Step 2: Apply migrations
echo ""
echo "Step 2: Applying migrations..."
cd "$(dirname "$SCRIPT_DIR")"
npx prisma migrate dev

echo ""
echo "✅ Migration complete! Database is safe."
echo "   Backups are stored in: ./backups/"
