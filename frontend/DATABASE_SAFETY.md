# Oro Database Safety Guide

This document explains how Oro protects your data during schema changes and migrations.

## Overview

Oro uses **Prisma** with **SQLite** for database management. Every schema change is tracked with migrations, and automatic backups protect against data loss.

## Key Safety Features

### 1. **Automatic Backups**
Every migration automatically creates a timestamped backup before making changes.

### 2. **Migration History**
Prisma tracks which migrations have been applied, preventing duplicate migrations.

### 3. **Rollback Support**
If something goes wrong, restore from any backup.

### 4. **Development vs Production**
Different commands for development and production prevent accidents.

## Safe Migration Workflow

### Development (Local)

**Always use the safe migration script:**

```bash
# Safe migration (includes automatic backup)
npm run db:migrate

# This is equivalent to:
# 1. ./scripts/db-backup.sh    # Creates backup
# 2. npx prisma migrate dev     # Applies migration
```

**Never use these dangerous commands:**

```bash
# ❌ DANGEROUS - Can overwrite data
npx prisma db push

# ❌ DANGEROUS - Skips backup
npx prisma migrate dev
```

### Production

```bash
# Production migrations (no interactive prompts)
npm run db:migrate:deploy

# This runs: npx prisma migrate deploy
```

## Scripts

### `npm run db:migrate` - Safe Development Migration
- Creates timestamped backup
- Applies pending migrations
- Keeps last 10 backups
- **Use this for all schema changes**

### `npm run db:backup` - Manual Backup
```bash
npm run db:backup
```
- Creates backup without running migrations
- Useful before major changes

### `npm run db:restore` - Restore from Backup
```bash
npm run db:restore
```
- Lists available backups
- Prompts for confirmation
- Creates safety backup before restoring

### `npm run db:studio` - Visual Database Browser
```bash
npm run db:studio
```
- Opens Prisma Studio at http://localhost:5555
- View and edit data visually
- No schema changes allowed (safe to use)

## Making Schema Changes

### Step-by-Step Process

1. **Edit the schema file:**
   ```bash
   # Edit: frontend/prisma/schema.prisma
   # Add your new fields or models
   ```

2. **Run safe migration:**
   ```bash
   npm run db:migrate
   ```

3. **Enter migration name when prompted:**
   ```
   Enter migration name: add_category_field
   ```

4. **Verify changes:**
   ```bash
   npm run db:studio
   ```

### Example: Adding a New Field

```prisma
// Before (prisma/schema.prisma)
model Prompt {
  id      String   @id @default(uuid())
  name    String   @unique
  content String
}

// After - Add category field
model Prompt {
  id       String   @id @default(uuid())
  name     String   @unique
  content  String
  category String?  // New field (nullable for safety)
}
```

Run migration:
```bash
npm run db:migrate
# Enter name: add_prompt_category
```

What happens:
1. ✅ Backup created: `backups/oro_backup_20250118_120000.db`
2. ✅ Migration file created: `prisma/migrations/20250118120000_add_prompt_category/`
3. ✅ Database updated: `category` column added to `prompts` table
4. ✅ Existing data preserved (category is NULL for old prompts)

## Disaster Recovery

### Scenario 1: Migration Failed

If a migration fails, your data is safe! Just restore from the automatic backup:

```bash
npm run db:restore
# Select the most recent backup
```

### Scenario 2: Wrong Migration Applied

Undo the migration and restore:

```bash
# List backups
ls -lth backups/

# Restore from before migration
npm run db:restore
# Select backup from before the migration
```

### Scenario 3: Accidental Data Deletion

Backups are created before every migration, so you can restore:

```bash
npm run db:restore
# Select appropriate backup
```

## Backup Management

### Automatic Cleanup
- Keeps last 10 backups automatically
- Older backups are removed during migration

### Manual Backup Management

```bash
# List all backups
ls -lth backups/

# Manually delete old backups
rm backups/oro_backup_20250101_*.db

# Keep important backups forever (move out of backups/)
cp backups/oro_backup_YYYYMMDD_HHMMSS.db ~/important-backups/
```

### Backup File Format

```
backups/oro_backup_YYYYMMDD_HHMMSS.db
                    ^^^^^^^^ ^^^^^^
                    Date     Time
```

Example: `backups/oro_backup_20250118_143000.db`
- Date: January 18, 2025
- Time: 14:30:00 (2:30 PM)

## Best Practices

### ✅ DO

- **Always use `npm run db:migrate`** for schema changes
- **Test migrations on a copy** of production data before deploying
- **Make fields nullable** when adding columns to existing tables
- **Keep backups** of important milestones
- **Use Prisma Studio** to verify data after migrations
- **Commit migration files** to git (they're your schema history)

### ❌ DON'T

- **Never use `npx prisma db push`** (bypasses migrations, can lose data)
- **Never manually edit the database** (migrations won't know about changes)
- **Never delete migration files** (breaks migration history)
- **Don't skip backups** (use the safe scripts)
- **Don't run migrations without testing first**

## Database Locations

```
frontend/
├── oro.db              # Main database (gitignored)
├── backups/            # Automatic backups (gitignored)
│   └── oro_backup_*.db
├── prisma/
│   ├── schema.prisma   # Schema definition (versioned)
│   └── migrations/     # Migration history (versioned)
└── scripts/
    ├── db-backup.sh    # Backup script
    ├── db-migrate.sh   # Safe migration
    └── db-restore.sh   # Restore script
```

## Troubleshooting

### "Migration already applied"
**Cause:** Trying to apply same migration twice
**Solution:** This is normal, Prisma prevents duplicate migrations

### "Cannot find database file"
**Cause:** Database doesn't exist yet
**Solution:** Run `npm run db:migrate` to create it

### "Prisma Client not generated"
**Cause:** Client not generated after migration
**Solution:** Run `npx prisma generate`

### "Migration failed, database in unknown state"
**Cause:** Migration crashed mid-way
**Solution:** Restore from backup and debug migration

## Migration Examples

### Add New Table
```prisma
model Category {
  id     Int     @id @default(autoincrement())
  name   String  @unique
  prompts Prompt[]
}

model Prompt {
  // ... existing fields
  categoryId Int?
  category   Category? @relation(fields: [categoryId], references: [id])
}
```

### Rename Field (Safe Method)
```prisma
// Step 1: Add new field
model Prompt {
  // ... existing fields
  promptText String? @map("content_new")  // New name
}

// Run migration: npm run db:migrate

// Step 2: Copy data (manual SQL or script)

// Step 3: Remove old field
model Prompt {
  // ... existing fields
  promptText String @map("content")  // Final name
}
```

## Questions?

- See Prisma docs: https://www.prisma.io/docs/concepts/components/prisma-migrate
- Check migration history: `ls -la prisma/migrations/`
- View current schema: `npx prisma studio`

---

**Remember:** Your data is precious. Always use the safe migration scripts!
