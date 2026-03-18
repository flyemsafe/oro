#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONFIG_FILE="$ROOT_DIR/.oro/projects.json"
NOTES_DIR=""
INBOX_FILE=""
PROMPTS_DIR=""
THREADS_DIR=""
TYPE="${TYPE:-}"
TITLE="${TITLE:-}"
RAW_TAGS="${RAW_TAGS:-}"
USE_STDIN_CONTENT=0
STDIN_IS_TTY=1
PROJECT="${PROJECT:-}"
CURRENT_DIR="${PWD}"
if [[ ! -t 0 ]]; then
  STDIN_IS_TTY=0
fi

usage() {
  cat <<'USAGE'
Usage: ./tools/capture-note.sh [options]

Options:
  --type <brain_dump|prompt|thread|note>
  --project <project-id|project-name|project-path>
  --title <title>
  --tags <comma,separated,tags>
  --stdin        Read entry content from stdin
  -h, --help     Show this help
USAGE
}

slugify() {
  echo "$1" \
    | tr '[:upper:]' '[:lower:]' \
    | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//' \
    | cut -c1-60
}

choose_type() {
  local choice
  echo "What are you dumping?" >&2
  echo "  1) brain_dump" >&2
  echo "  2) prompt" >&2
  echo "  3) thread" >&2
  echo "  4) note" >&2
  read -r -p "Choose [1-4] (default 1): " choice

  case "${choice:-1}" in
    1) echo "brain_dump" ;;
    2) echo "prompt" ;;
    3) echo "thread" ;;
    4) echo "note" ;;
    *)
      echo "Invalid choice. Using brain_dump." >&2
      echo "brain_dump"
      ;;
  esac
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --type)
      TYPE="${2:-}"
      shift 2
      ;;
    --project)
      PROJECT="${2:-}"
      shift 2
      ;;
    --title)
      TITLE="${2:-}"
      shift 2
      ;;
    --tags)
      RAW_TAGS="${2:-}"
      shift 2
      ;;
    --stdin)
      USE_STDIN_CONTENT=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage
      exit 1
      ;;
  esac
done

resolve_active_notes_dir() {
  local requested="${1:-}"
  if [[ ! -f "$CONFIG_FILE" ]]; then
    return 1
  fi

  node - "$CONFIG_FILE" "$requested" <<'NODE'
const fs = require('fs')
const configFile = process.argv[2]
const requested = process.argv[3] || ''

try {
  const raw = fs.readFileSync(configFile, 'utf8')
  const cfg = JSON.parse(raw)
  const projects = Array.isArray(cfg.projects) ? cfg.projects : []

  let match = null
  if (requested) {
    match = projects.find((p) =>
      p.id === requested || p.name === requested || p.projectPath === requested || p.notesDir === requested
    ) || null
  }

  if (!match && cfg.activeProjectId) {
    match = projects.find((p) => p.id === cfg.activeProjectId) || null
  }

  if (match && match.notesDir) {
    process.stdout.write(String(match.notesDir))
  }
} catch {}
NODE
}

resolve_workspace_root() {
  local candidate="${1:-$PWD}"

  if command -v git >/dev/null 2>&1 && git -C "$candidate" rev-parse --show-toplevel >/dev/null 2>&1; then
    git -C "$candidate" rev-parse --show-toplevel
  else
    echo "$candidate"
  fi
}

if [[ -n "${ORO_NOTES_DIR:-}" ]]; then
  NOTES_DIR="$ORO_NOTES_DIR"
elif [[ -n "$PROJECT" ]]; then
  RESOLVED_NOTES_DIR="$(resolve_active_notes_dir "$PROJECT" || true)"
  if [[ -z "$RESOLVED_NOTES_DIR" ]]; then
    echo "Project not found in $CONFIG_FILE: $PROJECT" >&2
    exit 1
  fi
  NOTES_DIR="$RESOLVED_NOTES_DIR"
else
  WORKSPACE_ROOT="$(resolve_workspace_root "$CURRENT_DIR")"
  if [[ "$WORKSPACE_ROOT" != "$ROOT_DIR" ]]; then
    NOTES_DIR="$WORKSPACE_ROOT"
  else
    RESOLVED_NOTES_DIR="$(resolve_active_notes_dir "" || true)"
    if [[ -n "$RESOLVED_NOTES_DIR" ]]; then
      NOTES_DIR="$RESOLVED_NOTES_DIR"
    else
      NOTES_DIR="$ROOT_DIR/notes"
    fi
  fi
fi

INBOX_FILE="$NOTES_DIR/INBOX.md"
PROMPTS_DIR="$NOTES_DIR/prompts"
THREADS_DIR="$NOTES_DIR/threads"
mkdir -p "$NOTES_DIR" "$PROMPTS_DIR" "$THREADS_DIR" "$NOTES_DIR/archive"
if [[ ! -f "$INBOX_FILE" || ! -s "$INBOX_FILE" ]]; then
  cat > "$INBOX_FILE" <<'EOF'
# Project Notes Inbox

Use this file for fast brain dumps and AI collaboration notes.
EOF
fi

if [[ "$STDIN_IS_TTY" -eq 0 ]]; then
  [[ "$USE_STDIN_CONTENT" -eq 0 ]] && USE_STDIN_CONTENT=1
  [[ -z "$TYPE" ]] && TYPE="brain_dump"
fi

if [[ -z "$TYPE" ]]; then
  TYPE="$(choose_type)"
fi

case "$TYPE" in
  brain_dump|prompt|thread|note) ;;
  *)
    echo "Invalid --type value: $TYPE" >&2
    exit 1
    ;;
esac

if [[ -z "$TITLE" && "$STDIN_IS_TTY" -eq 1 ]]; then
  read -r -p "Title (optional): " TITLE
fi

if [[ -z "$RAW_TAGS" && "$STDIN_IS_TTY" -eq 1 ]]; then
  read -r -p "Tags (comma separated, optional): " RAW_TAGS
fi

TS_ISO="$(date '+%Y-%m-%d %H:%M:%S')"
DATE_STAMP="$(date '+%Y-%m-%d')"
TIME_STAMP="$(date '+%H%M%S')"

TMP_FILE="$(mktemp)"
trap 'rm -f "$TMP_FILE"' EXIT

if [[ "$USE_STDIN_CONTENT" -eq 1 || ! -t 0 ]]; then
  cat > "$TMP_FILE"
else
  echo "Write your entry. Save and close the editor when done."
  "${EDITOR:-vi}" "$TMP_FILE"
fi

if [[ ! -s "$TMP_FILE" ]]; then
  echo "No content captured."
  exit 1
fi

if [[ -n "$RAW_TAGS" ]]; then
  TAGS_LINE="$(echo "$RAW_TAGS" | sed 's/,/ #/g; s/^/#/; s/  */ /g')"
else
  TAGS_LINE=""
fi

TITLE_SAFE="${TITLE:-untitled}"
SLUG="$(slugify "$TITLE_SAFE")"
[[ -z "$SLUG" ]] && SLUG="entry"

append_to_inbox() {
  {
    echo
    echo "## ${TS_ISO} [${TYPE}] ${TITLE:-}"
    [[ -n "$TAGS_LINE" ]] && echo "tags: ${TAGS_LINE}"
    echo
    cat "$TMP_FILE"
    echo
  } >> "$INBOX_FILE"
  echo "Saved to $INBOX_FILE"
}

write_entry_file() {
  local target_file="$1"
  {
    echo "# ${TITLE:-Untitled}"
    echo
    echo "- type: ${TYPE}"
    echo "- created_at: ${TS_ISO}"
    [[ -n "$TAGS_LINE" ]] && echo "- tags: ${TAGS_LINE}"
    echo
    echo "---"
    echo
    cat "$TMP_FILE"
    echo
  } > "$target_file"

  {
    echo
    echo "## ${TS_ISO} [${TYPE}] ${TITLE:-}"
    [[ -n "$TAGS_LINE" ]] && echo "tags: ${TAGS_LINE}"
    echo "file: ${target_file#$ROOT_DIR/}"
  } >> "$INBOX_FILE"

  echo "Saved to $target_file"
  echo "Indexed in $INBOX_FILE"
}

case "$TYPE" in
  prompt)
    TARGET_FILE="$PROMPTS_DIR/${DATE_STAMP}-${TIME_STAMP}-${SLUG}.md"
    write_entry_file "$TARGET_FILE"
    ;;
  thread)
    TARGET_FILE="$THREADS_DIR/${DATE_STAMP}-${TIME_STAMP}-${SLUG}.md"
    write_entry_file "$TARGET_FILE"
    ;;
  *)
    append_to_inbox
    ;;
esac
