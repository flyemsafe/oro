import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

export interface ProjectEntry {
  id: string
  name: string
  projectPath: string
  notesDir: string
  createdAt: string
  updatedAt: string
}

export interface ProjectsConfig {
  activeProjectId: string | null
  projects: ProjectEntry[]
}

interface AddProjectInput {
  name: string
  projectPath: string
  notesDir?: string
}

const DEFAULT_CONFIG: ProjectsConfig = {
  activeProjectId: null,
  projects: [],
}

function getRepoRoot(): string {
  const cwd = process.cwd()
  if (path.basename(cwd) === 'frontend') {
    return path.resolve(cwd, '..')
  }
  return cwd
}

function getConfigDir(): string {
  return path.join(getRepoRoot(), '.oro')
}

function getConfigPath(): string {
  return path.join(getConfigDir(), 'projects.json')
}

function ensureConfigDir(): void {
  fs.mkdirSync(getConfigDir(), { recursive: true })
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

export function loadProjectsConfig(): ProjectsConfig {
  const configPath = getConfigPath()

  if (!fs.existsSync(configPath)) {
    return { ...DEFAULT_CONFIG }
  }

  try {
    const raw = fs.readFileSync(configPath, 'utf8')
    const parsed = JSON.parse(raw) as ProjectsConfig

    if (!Array.isArray(parsed.projects)) {
      return { ...DEFAULT_CONFIG }
    }

    return {
      activeProjectId: parsed.activeProjectId ?? null,
      projects: parsed.projects,
    }
  } catch {
    return { ...DEFAULT_CONFIG }
  }
}

export function saveProjectsConfig(config: ProjectsConfig): void {
  ensureConfigDir()
  fs.writeFileSync(getConfigPath(), JSON.stringify(config, null, 2), 'utf8')
}

export function addProject(input: AddProjectInput): ProjectEntry {
  const name = input.name?.trim()
  const projectPath = path.resolve(input.projectPath?.trim() || '')

  if (!name) {
    throw new Error('Project name is required.')
  }

  if (!projectPath) {
    throw new Error('Project path is required.')
  }

  if (!fs.existsSync(projectPath) || !fs.statSync(projectPath).isDirectory()) {
    throw new Error('Project path must exist and be a directory.')
  }

  const config = loadProjectsConfig()
  const existing = config.projects.find((p) => p.projectPath === projectPath)

  if (existing) {
    return existing
  }

  const notesDir = input.notesDir?.trim()
    ? path.resolve(input.notesDir.trim())
    : path.join(projectPath, '.oro-notes')

  ensureNotesLayout(notesDir)

  const now = new Date().toISOString()
  const entry: ProjectEntry = {
    id: crypto.randomUUID(),
    name,
    projectPath,
    notesDir,
    createdAt: now,
    updatedAt: now,
  }

  config.projects.unshift(entry)
  if (!config.activeProjectId) {
    config.activeProjectId = entry.id
  }
  saveProjectsConfig(config)

  return entry
}

export function setActiveProject(projectId: string): ProjectsConfig {
  const config = loadProjectsConfig()
  const exists = config.projects.some((p) => p.id === projectId)

  if (!exists) {
    throw new Error('Project not found.')
  }

  config.activeProjectId = projectId
  saveProjectsConfig(config)
  return config
}

export function removeProject(projectId: string): ProjectsConfig {
  const config = loadProjectsConfig()
  const nextProjects = config.projects.filter((p) => p.id !== projectId)

  if (nextProjects.length === config.projects.length) {
    throw new Error('Project not found.')
  }

  config.projects = nextProjects

  if (config.activeProjectId === projectId) {
    config.activeProjectId = nextProjects.length > 0 ? nextProjects[0].id : null
  }

  saveProjectsConfig(config)
  return config
}
