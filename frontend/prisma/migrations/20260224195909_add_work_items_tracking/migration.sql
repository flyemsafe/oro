-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "source_path" TEXT,
    "source_hash" TEXT,
    "raw_content" TEXT,
    "extracted_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "work_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "session_id" TEXT,
    "title" TEXT NOT NULL,
    "details" TEXT,
    "source_path" TEXT,
    "source_line_start" INTEGER,
    "source_line_end" INTEGER,
    "source_excerpt" TEXT,
    "type" TEXT NOT NULL DEFAULT 'TASK',
    "status" TEXT NOT NULL DEFAULT 'TRIAGE',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "owner" TEXT,
    "tags" TEXT,
    "next_action" TEXT,
    "due_at" DATETIME,
    "closed_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "work_items_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "follow_ups" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "work_item_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "due_at" DATETIME,
    "completed_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "follow_ups_work_item_id_fkey" FOREIGN KEY ("work_item_id") REFERENCES "work_items" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "work_item_prompt_links" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "work_item_id" TEXT NOT NULL,
    "prompt_id" TEXT NOT NULL,
    "link_type" TEXT NOT NULL DEFAULT 'reference',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "work_item_prompt_links_work_item_id_fkey" FOREIGN KEY ("work_item_id") REFERENCES "work_items" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "work_item_prompt_links_prompt_id_fkey" FOREIGN KEY ("prompt_id") REFERENCES "prompts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "sessions_source_hash_key" ON "sessions"("source_hash");

-- CreateIndex
CREATE INDEX "sessions_source_path_idx" ON "sessions"("source_path");

-- CreateIndex
CREATE INDEX "sessions_created_at_idx" ON "sessions"("created_at");

-- CreateIndex
CREATE INDEX "work_items_session_id_idx" ON "work_items"("session_id");

-- CreateIndex
CREATE INDEX "work_items_status_idx" ON "work_items"("status");

-- CreateIndex
CREATE INDEX "work_items_priority_idx" ON "work_items"("priority");

-- CreateIndex
CREATE INDEX "work_items_type_idx" ON "work_items"("type");

-- CreateIndex
CREATE INDEX "work_items_due_at_idx" ON "work_items"("due_at");

-- CreateIndex
CREATE INDEX "work_items_created_at_idx" ON "work_items"("created_at");

-- CreateIndex
CREATE INDEX "follow_ups_work_item_id_idx" ON "follow_ups"("work_item_id");

-- CreateIndex
CREATE INDEX "follow_ups_status_idx" ON "follow_ups"("status");

-- CreateIndex
CREATE INDEX "follow_ups_due_at_idx" ON "follow_ups"("due_at");

-- CreateIndex
CREATE INDEX "work_item_prompt_links_prompt_id_idx" ON "work_item_prompt_links"("prompt_id");

-- CreateIndex
CREATE UNIQUE INDEX "work_item_prompt_links_work_item_id_prompt_id_key" ON "work_item_prompt_links"("work_item_id", "prompt_id");
