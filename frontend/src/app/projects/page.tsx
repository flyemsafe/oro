'use client'

import { useEffect, useMemo, useState } from 'react'
import { FolderOpen, Trash2, CheckCircle2 } from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type ProjectEntry = {
  id: string
  name: string
  projectPath: string
  notesDir: string
  createdAt: string
  updatedAt: string
}

type ProjectsConfig = {
  activeProjectId: string | null
  projects: ProjectEntry[]
}

const EMPTY_CONFIG: ProjectsConfig = {
  activeProjectId: null,
  projects: [],
}

export default function ProjectsPage() {
  const [config, setConfig] = useState<ProjectsConfig>(EMPTY_CONFIG)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [projectPath, setProjectPath] = useState('')
  const [notesDir, setNotesDir] = useState('')

  async function refresh() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/v1/projects')
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load projects.')
      }
      setConfig(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  const activeProject = useMemo(
    () => config.projects.find((p) => p.id === config.activeProjectId) ?? null,
    [config]
  )

  async function handleAddProject(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    try {
      const res = await fetch('/api/v1/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, projectPath, notesDir: notesDir || undefined }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add project.')
      }

      setName('')
      setProjectPath('')
      setNotesDir('')
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add project.')
    }
  }

  async function setActive(projectId: string) {
    setError(null)
    try {
      const res = await fetch('/api/v1/projects/active', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to set active project.')
      }
      setConfig(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set active project.')
    }
  }

  async function remove(projectId: string) {
    setError(null)
    try {
      const res = await fetch('/api/v1/projects', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to remove project.')
      }
      setConfig(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove project.')
    }
  }

  return (
    <Layout>
      <div className="container mx-auto py-6 px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-2">
            Register project paths so Oro can store notes directly inside each project.
          </p>
        </div>

        {activeProject && (
          <Card className="mb-6 border-oro-orange-200 dark:border-oro-orange-900/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-oro-orange-600 dark:text-oro-orange-400">
                <CheckCircle2 className="h-5 w-5" />
                Active Project
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p><strong>{activeProject.name}</strong></p>
              <p className="text-muted-foreground">path: {activeProject.projectPath}</p>
              <p className="text-muted-foreground">notes: {activeProject.notesDir}</p>
            </CardContent>
          </Card>
        )}

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Add Project</CardTitle>
            <CardDescription>
              Default notes directory is <code>.oro-notes</code> inside the project path.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleAddProject}>
              <div className="space-y-2">
                <Label htmlFor="project-name">Project Name</Label>
                <Input
                  id="project-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Mesingi"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="project-path">Project Path</Label>
                <Input
                  id="project-path"
                  value={projectPath}
                  onChange={(e) => setProjectPath(e.target.value)}
                  placeholder="/home/radmin/Workspaces/swyguehub/mesingi"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes-dir">Notes Directory (optional)</Label>
                <Input
                  id="notes-dir"
                  value={notesDir}
                  onChange={(e) => setNotesDir(e.target.value)}
                  placeholder="/home/radmin/Workspaces/swyguehub/mesingi/docs/human-notes"
                />
              </div>

              <div className="md:col-span-2">
                <Button type="submit" className="bg-[#f78f2a] hover:bg-[#f78f2a]/90">
                  Add Project
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Registered Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading projects...</p>
            ) : config.projects.length === 0 ? (
              <p className="text-sm text-muted-foreground">No projects added yet.</p>
            ) : (
              <div className="space-y-3">
                {config.projects.map((project) => {
                  const isActive = config.activeProjectId === project.id
                  return (
                    <div
                      key={project.id}
                      className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">
                          {project.name}
                          {isActive && (
                            <span className="ml-2 text-xs px-2 py-0.5 rounded bg-oro-orange-100 text-oro-orange-700 dark:bg-oro-orange-900/30 dark:text-oro-orange-300">
                              Active
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">path: {project.projectPath}</p>
                        <p className="text-xs text-muted-foreground">notes: {project.notesDir}</p>
                      </div>

                      <div className="flex gap-2">
                        {!isActive && (
                          <Button variant="outline" onClick={() => void setActive(project.id)}>
                            Set Active
                          </Button>
                        )}
                        <Button variant="outline" className="text-destructive" onClick={() => void remove(project.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {error && (
          <p className="mt-4 text-sm text-destructive">{error}</p>
        )}
      </div>
    </Layout>
  )
}
