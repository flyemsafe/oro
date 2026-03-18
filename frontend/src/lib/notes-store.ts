import fs from 'fs'
import path from 'path'
import { loadProjectsConfig, ProjectEntry } from '@/lib/projects-store'

export type NotesEntryType = 'brain_dump' | 'note' | 'prompt' | 'thread'

interface CreateNotesEntryInput {
  type: NotesEntryType
  title?: string
  tags?: string
  content: string
  projectId?: string
}

export interface NotesContext {
  notesDir: string
  inboxFile: string
  activeProject: ProjectEntry | null
}

export interface NotesEntryResult {
  type: NotesEntryType
  title: string
  createdAt: string
  notesDir: string
  inboxFile: string
  targetFile?: string
  activeProject: ProjectEntry | null
}

function getRepoRoot(): string {
  const cwd = process.cwd()
  if (path.basename(cwd) === 'frontend') {
    return path.resolve(cwd, '..')
  }
  return cwd
}

function getTimestampParts(date: Date): { iso: string; dateStamp: string; timeStamp: string } {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  const second = String(date.getSeconds()).padStart(2, '0')

  return {
    iso: `${year}-${month}-${day} ${hour}:${minute}:${second}`,
    dateStamp: `${year}-${month}-${day}`,
    timeStamp: `${hour}${minute}${second}`,
  }
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

function formatTagsLine(rawTags?: string): string | null {
  if (!rawTags?.trim()) {
    return null
  }

  const tags = rawTags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => `#${tag.replace(/^#+/, '')}`)

  return tags.length > 0 ? tags.join(' ') : null
}

function ensureNotesLayout(notesDir: string): void {
  fs.mkdirSync(notesDir, { recursive: true })
  fs.mkdirSync(path.join(notesDir, 'prompts'), { recursive: true })
  fs.mkdirSync(path.join(notesDir, 'threads'), { recursive: true })
  fs.mkdirSync(path.join(notesDir, 'archive'), { recursive: true })

  const inboxPath = path.join(notesDir, 'INBOX.md')
  if (!fs.existsSync(inboxPath)) {
    fs.writeFileSync(
      inboxPath,
      '# Project Notes Inbox\n\nUse this file for fast brain dumps and AI collaboration notes.\n',
      'utf8'
    )
  }
}

function resolveContext(projectId?: string): NotesContext {
  const config = loadProjectsConfig()
  const activeProject = projectId
    ? config.projects.find((project) => project.id === projectId) ?? null
    : config.projects.find((project) => project.id === config.activeProjectId) ?? null

  const notesDir = activeProject?.notesDir ?? path.join(getRepoRoot(), 'notes')
  ensureNotesLayout(notesDir)

  return {
    notesDir,
    inboxFile: path.join(notesDir, 'INBOX.md'),
    activeProject,
  }
}

function appendInboxIndex(inboxFile: string, type: NotesEntryType, title: string, tagsLine: string | null, filePath: string): void {
  const { iso } = getTimestampParts(new Date())
  const lines = [
    '',
    `## ${iso} [${type}] ${title}`,
    ...(tagsLine ? [`tags: ${tagsLine}`] : []),
    `file: ${filePath}`,
    '',
  ]
  fs.appendFileSync(inboxFile, `${lines.join('\n')}\n`, 'utf8')
}

export function getNotesContext(projectId?: string): NotesContext {
  return resolveContext(projectId)
}

export function createNotesEntry(input: CreateNotesEntryInput): NotesEntryResult {
  const type = input.type
  const content = input.content?.trim()
  const title = input.title?.trim() || 'Untitled'

  if (!content) {
    throw new Error('Content is required.')
  }

  const context = resolveContext(input.projectId)
  const tagsLine = formatTagsLine(input.tags)
  const { iso, dateStamp, timeStamp } = getTimestampParts(new Date())

  if (type === 'brain_dump' || type === 'note') {
    const lines = [
      '',
      `## ${iso} [${type}] ${input.title?.trim() || ''}`.trimEnd(),
      ...(tagsLine ? [`tags: ${tagsLine}`] : []),
      '',
      content,
      '',
    ]
    fs.appendFileSync(context.inboxFile, `${lines.join('\n')}\n`, 'utf8')

    return {
      type,
      title,
      createdAt: iso,
      notesDir: context.notesDir,
      inboxFile: context.inboxFile,
      activeProject: context.activeProject,
    }
  }

  const slugBase = slugify(input.title?.trim() || 'entry') || 'entry'
  const folder = type === 'prompt' ? 'prompts' : 'threads'
  const targetFile = path.join(context.notesDir, folder, `${dateStamp}-${timeStamp}-${slugBase}.md`)
  const frontMatterLines = [
    `# ${title}`,
    '',
    `- type: ${type}`,
    `- created_at: ${iso}`,
    ...(tagsLine ? [`- tags: ${tagsLine}`] : []),
    '',
    '---',
    '',
    content,
    '',
  ]
  fs.writeFileSync(targetFile, `${frontMatterLines.join('\n')}\n`, 'utf8')
  appendInboxIndex(context.inboxFile, type, input.title?.trim() || '', tagsLine, targetFile)

  return {
    type,
    title,
    createdAt: iso,
    notesDir: context.notesDir,
    inboxFile: context.inboxFile,
    targetFile,
    activeProject: context.activeProject,
  }
}
