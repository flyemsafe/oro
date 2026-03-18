-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_prompts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "system_prompt" TEXT,
    "description" TEXT,
    "is_favorite" BOOLEAN NOT NULL DEFAULT false,
    "is_template" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_prompts" ("content", "created_at", "description", "id", "name", "system_prompt", "updated_at") SELECT "content", "created_at", "description", "id", "name", "system_prompt", "updated_at" FROM "prompts";
DROP TABLE "prompts";
ALTER TABLE "new_prompts" RENAME TO "prompts";
CREATE UNIQUE INDEX "prompts_name_key" ON "prompts"("name");
CREATE INDEX "prompts_name_idx" ON "prompts"("name");
CREATE INDEX "prompts_created_at_idx" ON "prompts"("created_at");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
