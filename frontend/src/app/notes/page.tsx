'use client'

import { FormEvent, useEffect, useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type NoteType = 'brain_dump' | 'note' | 'prompt' | 'thread'

type ProjectEntry = {
  id: string
  name: string
  projectPath: string
  notesDir: string
}

type NotesContext = {
  notesDir: string
  inboxFile: string
  activeProject: ProjectEntry | null
}

type SaveResponse = {
  type: NoteType
  title: string
  createdAt: string
  notesDir: string
  inboxFile: string
  targetFile?: string
}

const EMPTY_CONTEXT: NotesContext = {
  notesDir: '',
  inboxFile: '',
  activeProject: null,
}

export default function NotesPage() {
  const [context, setContext] = useState<NotesContext>(EMPTY_CONTEXT)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [type, setType] = useState<NoteType>('brain_dump')
  const [title, setTitle] = useState('')
  const [tags, setTags] = useState('')
  const [content, setContent] = useState('')

  async function loadContext() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/v1/notes')
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load notes context.')
      }
      setContext(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notes context.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadContext()
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    setSaving(true)

    try {
      const res = await fetch('/api/v1/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          title: title || undefined,
          tags: tags || undefined,
          content,
          projectId: context.activeProject?.id,
        }),
      })

      const data = (await res.json()) as SaveResponse & { error?: string }
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save note.')
      }

      const savedPath = data.targetFile || data.inboxFile
      setSuccess(`Saved ${data.type} entry to ${savedPath}`)
      setContent('')
      if (type === 'prompt' || type === 'thread') {
        setTitle('')
      }
      await loadContext()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save note.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Layout>
      <div className="container mx-auto py-6 px-4 max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notes Session</h1>
          <p className="text-muted-foreground mt-2">
            Capture what you are working on and store it in your active project notes directory.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Storage Target</CardTitle>
            <CardDescription>
              Notes are written to your active project when configured, otherwise to this repository&apos;s notes folder.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            {loading ? (
              <p className="text-muted-foreground">Loading notes context...</p>
            ) : (
              <>
                <p>
                  <strong>active project:</strong> {context.activeProject?.name || 'None'}
                </p>
                <p className="text-muted-foreground">notes dir: {context.notesDir}</p>
                <p className="text-muted-foreground">inbox: {context.inboxFile}</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Capture Entry</CardTitle>
            <CardDescription>
              `brain_dump` and `note` append to INBOX. `prompt` and `thread` create files and index them in INBOX.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="note-type">Type</Label>
                <select
                  id="note-type"
                  value={type}
                  onChange={(event) => setType(event.target.value as NoteType)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="brain_dump">brain_dump</option>
                  <option value="note">note</option>
                  <option value="prompt">prompt</option>
                  <option value="thread">thread</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="note-title">Title (optional)</Label>
                <Input
                  id="note-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Weekly launch planning"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="note-tags">Tags (optional)</Label>
                <Input
                  id="note-tags"
                  value={tags}
                  onChange={(event) => setTags(event.target.value)}
                  placeholder="planning,launch,handoff"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="note-content">Content</Label>
                <Textarea
                  id="note-content"
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="What are you working on right now?"
                  className="min-h-[220px]"
                  required
                />
              </div>

              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Entry'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {success && <p className="text-sm text-emerald-600 dark:text-emerald-400">{success}</p>}
      </div>
    </Layout>
  )
}
