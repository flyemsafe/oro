#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_DIR="$ROOT_DIR/frontend"
SESSION_NAME="oro"
ATTACH=1
KILL=0

usage() {
  cat <<'USAGE'
Usage: ./tools/oro-session.sh [options]

Starts (or attaches to) a tmux session for Oro.

Options:
  --name <session-name>  Override tmux session name (default: oro)
  --no-attach            Create/ensure session but do not attach
  --kill                 Kill the session and exit
  -h, --help             Show this help
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --name)
      SESSION_NAME="${2:-}"
      shift 2
      ;;
    --no-attach)
      ATTACH=0
      shift
      ;;
    --kill)
      KILL=1
      ATTACH=0
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

if ! command -v tmux >/dev/null 2>&1; then
  echo "tmux is required for this session script. Install tmux and retry." >&2
  exit 1
fi

if [[ "$KILL" -eq 1 ]]; then
  if tmux has-session -t "$SESSION_NAME" 2>/dev/null; then
    tmux kill-session -t "$SESSION_NAME"
    echo "Killed tmux session: $SESSION_NAME"
  else
    echo "No tmux session found: $SESSION_NAME"
  fi
  exit 0
fi

if tmux has-session -t "$SESSION_NAME" 2>/dev/null; then
  echo "Session exists: $SESSION_NAME"
  if [[ "$ATTACH" -eq 1 ]]; then
    exec tmux attach-session -t "$SESSION_NAME"
  fi
  exit 0
fi

# Create new session with three windows:
# 1) notes/root shell
# 2) frontend dev server
# 3) git shell

tmux new-session -d -s "$SESSION_NAME" -n notes -c "$ROOT_DIR"
tmux send-keys -t "$SESSION_NAME":notes "clear" C-m

tmux new-window -t "$SESSION_NAME" -n dev -c "$FRONTEND_DIR"
tmux send-keys -t "$SESSION_NAME":dev "npm run dev" C-m

tmux new-window -t "$SESSION_NAME" -n git -c "$ROOT_DIR"
tmux send-keys -t "$SESSION_NAME":git "git status --short" C-m

tmux select-window -t "$SESSION_NAME":notes

echo "Created tmux session: $SESSION_NAME"
echo "Windows: notes | dev | git"

if [[ "$ATTACH" -eq 1 ]]; then
  exec tmux attach-session -t "$SESSION_NAME"
fi
