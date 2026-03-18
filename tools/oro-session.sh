#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONFIG_FILE="$ROOT_DIR/.oro/projects.json"
CAPTURE_SCRIPT="$ROOT_DIR/tools/capture-note.sh"
CURRENT_DIR="$PWD"
PROJECT="${PROJECT:-}"
NOTES_DIR="${ORO_NOTES_DIR:-}"
TITLE="${TITLE:-}"
RAW_TAGS="${RAW_TAGS:-}"
ACTION=""
CAPTURE_TYPE=""
NO_EDITOR=0

usage() {
  cat <<'USAGE'
Usage: ./tools/oro-session.sh [options]

Start a human notes session (no tmux) and open files in your editor.
By default, notes are stored in your current workspace root.

Options:
  --menu                 Show interactive action menu (default)
  --kickoff              Add a task kickoff template to INBOX.md and open it
  --inbox                Open INBOX.md in editor
  --prompt               Create prompts/<timestamp>-<slug>.md and open it
  --thread               Create threads/<timestamp>-<slug>.md and open it
  --capture <type>       Run capture-note flow for type:
                         brain_dump|prompt|thread|note
  --project <project>    Registered project id/name/path from .oro/projects.json
  --notes-dir <path>     Explicit notes directory override
  --cwd <path>           Resolve workspace as if launched from this directory
  --title <title>        Optional title for created entry
  --tags <tags>          Optional comma-separated tags
  --no-editor            Do not open files in $EDITOR
  -h, --help             Show this help
USAGE
}

slugify() {
  echo "$1" \
    | tr '[:upper:]' '[:lower:]' \
    | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//' \
    | cut -c1-60
}

format_tags_line() {
  local raw="${1:-}"
  if [[ -z "$raw" ]]; then
    echo ""
    return
  fi
  echo "$raw" | sed 's/,/ #/g; s/^/#/; s/  */ /g'
}

resolve_workspace_root() {
  local candidate="${1:-$PWD}"
  if command -v git >/dev/null 2>&1 && git -C "$candidate" rev-parse --show-toplevel >/dev/null 2>&1; then
    git -C "$candidate" rev-parse --show-toplevel
  else
    echo "$candidate"
  fi
}

resolve_project_notes_dir() {
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

open_editor() {
  local file_path="$1"
  if [[ "$NO_EDITOR" -eq 0 ]]; then
    "${EDITOR:-vi}" "$file_path"
  fi
}

ensure_notes_layout() {
  INBOX_FILE="$NOTES_DIR/INBOX.md"
  PROMPTS_DIR="$NOTES_DIR/prompts"
  THREADS_DIR="$NOTES_DIR/threads"
  ARCHIVE_DIR="$NOTES_DIR/archive"

  mkdir -p "$NOTES_DIR" "$PROMPTS_DIR" "$THREADS_DIR" "$ARCHIVE_DIR"
  if [[ ! -f "$INBOX_FILE" ]]; then
    cat > "$INBOX_FILE" <<'EOF'
# Project Notes Inbox

Use this file for fast brain dumps and AI collaboration notes.
EOF
  fi
}

add_inbox_index() {
  local entry_type="$1"
  local file_path="$2"
  local ts_iso
  local tags_line
  ts_iso="$(date '+%Y-%m-%d %H:%M:%S')"
  tags_line="$(format_tags_line "$RAW_TAGS")"
  {
    echo
    echo "## ${ts_iso} [${entry_type}] ${TITLE:-}"
    [[ -n "$tags_line" ]] && echo "tags: ${tags_line}"
    echo "file: ${file_path}"
  } >> "$INBOX_FILE"
}

create_prompt_file() {
  local date_stamp time_stamp ts_iso title_safe slug target_file tags_line
  date_stamp="$(date '+%Y-%m-%d')"
  time_stamp="$(date '+%H%M%S')"
  ts_iso="$(date '+%Y-%m-%d %H:%M:%S')"
  title_safe="${TITLE:-untitled-prompt}"
  slug="$(slugify "$title_safe")"
  [[ -z "$slug" ]] && slug="prompt"
  tags_line="$(format_tags_line "$RAW_TAGS")"
  target_file="$PROMPTS_DIR/${date_stamp}-${time_stamp}-${slug}.md"

  {
    echo "# ${TITLE:-Untitled Prompt}"
    echo
    echo "- type: prompt"
    echo "- created_at: ${ts_iso}"
    [[ -n "$tags_line" ]] && echo "- tags: ${tags_line}"
    echo
    echo "---"
    echo
    echo "## Context"
    echo
    echo "## Prompt"
    echo
    echo "## Notes"
    echo
  } > "$target_file"

  add_inbox_index "prompt" "$target_file"
  echo "Created prompt file: $target_file"
  open_editor "$target_file"
}

create_thread_file() {
  local date_stamp time_stamp ts_iso title_safe slug target_file tags_line
  date_stamp="$(date '+%Y-%m-%d')"
  time_stamp="$(date '+%H%M%S')"
  ts_iso="$(date '+%Y-%m-%d %H:%M:%S')"
  title_safe="${TITLE:-untitled-thread}"
  slug="$(slugify "$title_safe")"
  [[ -z "$slug" ]] && slug="thread"
  tags_line="$(format_tags_line "$RAW_TAGS")"
  target_file="$THREADS_DIR/${date_stamp}-${time_stamp}-${slug}.md"

  {
    echo "# ${TITLE:-Untitled Thread}"
    echo
    echo "- type: thread"
    echo "- created_at: ${ts_iso}"
    [[ -n "$tags_line" ]] && echo "- tags: ${tags_line}"
    echo
    echo "---"
    echo
    echo "## Goal"
    echo
    echo "## Conversation"
    echo
    echo "- user:"
    echo "- assistant:"
    echo
    echo "## Follow-ups"
    echo
  } > "$target_file"

  add_inbox_index "thread" "$target_file"
  echo "Created thread file: $target_file"
  open_editor "$target_file"
}

start_kickoff() {
  local ts_iso tags_line
  ts_iso="$(date '+%Y-%m-%d %H:%M:%S')"
  tags_line="$(format_tags_line "$RAW_TAGS")"
  {
    echo
    echo "## ${ts_iso} [session] ${TITLE:-Work Session}"
    [[ -n "$tags_line" ]] && echo "tags: ${tags_line}"
    echo
    echo "- Focus:"
    echo "- Tasks:"
    echo "  - [ ] "
    echo "- Blockers:"
    echo "- Notes:"
    echo
  } >> "$INBOX_FILE"
  echo "Kickoff template added to: $INBOX_FILE"
  open_editor "$INBOX_FILE"
}

run_capture() {
  local capture_type="$1"
  local args=("$CAPTURE_SCRIPT" --type "$capture_type")

  [[ -n "$TITLE" ]] && args+=(--title "$TITLE")
  [[ -n "$RAW_TAGS" ]] && args+=(--tags "$RAW_TAGS")

  ORO_NOTES_DIR="$NOTES_DIR" "${args[@]}"
}

choose_action_menu() {
  local choice
  echo "Notes directory: $NOTES_DIR"
  echo
  echo "Choose an action:"
  echo "  1) Kickoff session in INBOX"
  echo "  2) Open INBOX"
  echo "  3) New prompt file"
  echo "  4) New thread file"
  echo "  5) Capture brain_dump"
  echo "  6) Capture note"
  echo "  7) Capture prompt"
  echo "  8) Capture thread"
  read -r -p "Choice [1-8] (default 1): " choice

  case "${choice:-1}" in
    1) ACTION="kickoff" ;;
    2) ACTION="inbox" ;;
    3) ACTION="prompt" ;;
    4) ACTION="thread" ;;
    5) ACTION="capture"; CAPTURE_TYPE="brain_dump" ;;
    6) ACTION="capture"; CAPTURE_TYPE="note" ;;
    7) ACTION="capture"; CAPTURE_TYPE="prompt" ;;
    8) ACTION="capture"; CAPTURE_TYPE="thread" ;;
    *)
      echo "Invalid choice. Using kickoff."
      ACTION="kickoff"
      ;;
  esac
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --menu)
      ACTION="menu"
      shift
      ;;
    --kickoff)
      ACTION="kickoff"
      shift
      ;;
    --inbox)
      ACTION="inbox"
      shift
      ;;
    --prompt)
      ACTION="prompt"
      shift
      ;;
    --thread)
      ACTION="thread"
      shift
      ;;
    --capture)
      ACTION="capture"
      CAPTURE_TYPE="${2:-}"
      shift 2
      ;;
    --project)
      PROJECT="${2:-}"
      shift 2
      ;;
    --notes-dir)
      NOTES_DIR="${2:-}"
      shift 2
      ;;
    --cwd)
      CURRENT_DIR="${2:-}"
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
    --no-editor)
      NO_EDITOR=1
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

if [[ -z "$NOTES_DIR" ]]; then
  if [[ -n "$PROJECT" ]]; then
    RESOLVED_NOTES_DIR="$(resolve_project_notes_dir "$PROJECT" || true)"
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
      RESOLVED_NOTES_DIR="$(resolve_project_notes_dir "" || true)"
      if [[ -n "$RESOLVED_NOTES_DIR" ]]; then
        NOTES_DIR="$RESOLVED_NOTES_DIR"
      else
        NOTES_DIR="$ROOT_DIR/notes"
      fi
    fi
  fi
fi

ensure_notes_layout

if [[ -z "$ACTION" || "$ACTION" == "menu" ]]; then
  choose_action_menu
fi

case "$ACTION" in
  kickoff)
    start_kickoff
    ;;
  inbox)
    echo "Opening: $INBOX_FILE"
    open_editor "$INBOX_FILE"
    ;;
  prompt)
    create_prompt_file
    ;;
  thread)
    create_thread_file
    ;;
  capture)
    case "$CAPTURE_TYPE" in
      brain_dump|prompt|thread|note)
        run_capture "$CAPTURE_TYPE"
        ;;
      *)
        echo "Invalid --capture type: $CAPTURE_TYPE" >&2
        exit 1
        ;;
    esac
    ;;
  *)
    echo "Unknown action: $ACTION" >&2
    exit 1
    ;;
esac
