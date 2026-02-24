# Notes Workflow (File-First)

This is a low-friction capture system for working with AI.

## Goals
- Dump thoughts fast.
- Keep everything as plain Markdown files.
- Stay editor-friendly.

## Files
- `INBOX.md`: raw brain dump and quick notes.
- `prompts/`: one file per prompt capture.
- `threads/`: one file per conversation thread capture.
- `archive/`: old material when you want to clean up.

## Capture command
From repo root:

```bash
./tools/capture-note.sh
```

If you configured projects in the Oro UI (`/projects`), capture defaults to the active project's notes directory.

The script asks:
1. What type of dump (`brain_dump`, `prompt`, `thread`, `note`)
2. Optional title
3. Optional tags
4. Opens your editor for content

## Behavior
- `brain_dump` and `note` append directly to `INBOX.md`.
- `prompt` creates `notes/prompts/<timestamp>-<slug>.md` and adds an index line in `INBOX.md`.
- `thread` creates `notes/threads/<timestamp>-<slug>.md` and adds an index line in `INBOX.md`.

## Optional shortcuts
Set your editor before running:

```bash
export EDITOR=nvim
```

Pipe content directly:

```bash
echo "Quick thought" | ./tools/capture-note.sh
```

Pipe with explicit metadata:

```bash
echo "Refine this prompt for AB test messaging" \
  | ./tools/capture-note.sh --type prompt --title "AB test prompt" --tags "prompt,experiment" --stdin
```

Capture for a specific configured project:

```bash
./tools/capture-note.sh --project mesingi
```
