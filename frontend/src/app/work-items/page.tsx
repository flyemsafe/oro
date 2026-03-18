'use client'

import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Clock3, AlertTriangle, Upload, WandSparkles } from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type WorkItemStatus = 'TRIAGE' | 'OPEN' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE'
type WorkItemType = 'TASK' | 'PROMPT' | 'QUESTION' | 'DECISION' | 'RISK'
type WorkItemPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
type WorkItemsView = 'open' | 'triage'

type WorkItem = {
  id: string
  title: string
  details: string | null
  sourcePath: string | null
  sourceLineStart: number | null
  sourceLineEnd: number | null
  type: WorkItemType
  status: WorkItemStatus
  priority: WorkItemPriority
  tags: string | null
  nextAction: string | null
  dueAt: string | null
  createdAt: string
  updatedAt: string
  session: {
    id: string
    title: string
    source: string
    sourcePath: string | null
  } | null
  followUps: Array<{
    id: string
    title: string
    status: string
    dueAt: string | null
  }>
}

type WorkItemsResponse = {
  items: WorkItem[]
  counts: {
    triage: number
    open: number
    done: number
    total: number
  }
}

const STATUS_OPTIONS: WorkItemStatus[] = ['TRIAGE', 'OPEN', 'IN_PROGRESS', 'BLOCKED', 'DONE']
const VIEW_OPTIONS: Array<{ id: WorkItemsView; label: string }> = [
  { id: 'open', label: 'Open Loops' },
  { id: 'triage', label: 'Needs Triage' },
]

const EMPTY_RESPONSE: WorkItemsResponse = {
  items: [],
  counts: { triage: 0, open: 0, done: 0, total: 0 },
}

function priorityClass(priority: WorkItemPriority): string {
  switch (priority) {
    case 'URGENT':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
    case 'HIGH':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
    case 'MEDIUM':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300'
  }
}

function statusClass(status: WorkItemStatus): string {
  switch (status) {
    case 'DONE':
      return 'text-emerald-600 dark:text-emerald-400'
    case 'BLOCKED':
      return 'text-red-600 dark:text-red-400'
    case 'IN_PROGRESS':
      return 'text-blue-600 dark:text-blue-400'
    case 'OPEN':
      return 'text-orange-600 dark:text-orange-400'
    default:
      return 'text-muted-foreground'
  }
}

export default function WorkItemsPage() {
  const [view, setView] = useState<WorkItemsView>('open')
  const [search, setSearch] = useState('')
  const [data, setData] = useState<WorkItemsResponse>(EMPTY_RESPONSE)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [extracting, setExtracting] = useState(false)
  const [promotingId, setPromotingId] = useState<string | null>(null)

  const [captureTitle, setCaptureTitle] = useState('')
  const [captureSource, setCaptureSource] = useState('manual')
  const [captureContent, setCaptureContent] = useState('')

  async function loadWorkItems(nextView = view, nextSearch = search) {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        view: nextView,
      })
      if (nextSearch.trim()) {
        params.set('search', nextSearch.trim())
      }

      const res = await fetch(`/api/v1/work-items?${params.toString()}`)
      const payload = (await res.json()) as WorkItemsResponse & { error?: string }

      if (!res.ok) {
        throw new Error(payload.error || 'Failed to load work items.')
      }

      setData(payload)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load work items.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadWorkItems()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view])

  async function updateStatus(id: string, status: WorkItemStatus) {
    setError(null)
    setMessage(null)
    try {
      const res = await fetch(`/api/v1/work-items/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      const payload = (await res.json()) as { error?: string }
      if (!res.ok) {
        throw new Error(payload.error || 'Failed to update status.')
      }

      setMessage('Work item updated.')
      await loadWorkItems()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status.')
    }
  }

  async function captureSession(force = false) {
    if (!captureContent.trim()) {
      setError('Session transcript content is required.')
      return
    }

    setExtracting(true)
    setError(null)
    setMessage(null)

    try {
      const res = await fetch('/api/v1/work-items/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: captureSource || 'manual',
          title: captureTitle || undefined,
          content: captureContent,
          force,
        }),
      })
      const payload = (await res.json()) as {
        error?: string
        createdCount?: number
        reused?: boolean
      }

      if (!res.ok) {
        throw new Error(payload.error || 'Failed to capture session')
      }

      if (payload.reused) {
        setMessage('Session already exists and was reused.')
      } else {
        setMessage(`Captured session and extracted ${payload.createdCount || 0} work items.`)
      }
      setCaptureContent('')
      setCaptureTitle('')
      await loadWorkItems()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to capture session')
    } finally {
      setExtracting(false)
    }
  }

  async function promoteToPrompt(workItemId: string) {
    setPromotingId(workItemId)
    setError(null)
    setMessage(null)

    try {
      const res = await fetch(`/api/v1/work-items/${workItemId}/promote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const payload = (await res.json()) as {
        error?: string
        prompt?: {
          id: string
          title: string
        }
      }

      if (!res.ok) {
        throw new Error(payload.error || 'Failed to promote work item.')
      }

      setMessage(`Promoted to prompt library: ${payload.prompt?.title || 'Untitled prompt'}`)
      await loadWorkItems()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to promote work item.')
    } finally {
      setPromotingId(null)
    }
  }

  const heading = useMemo(
    () => (view === 'open' ? 'Open Loops' : 'Needs Triage'),
    [view]
  )

  return (
    <Layout>
      <div className="container mx-auto py-6 px-4 max-w-6xl space-y-6">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Work Items</h1>
            <p className="text-muted-foreground mt-2">
              Track unresolved prompts, tasks, risks, and decisions from long AI sessions.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Capture Session</CardTitle>
            <CardDescription>
              Paste an AI conversation transcript to extract follow-up items for triage and execution.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="session-title">Session title (optional)</Label>
                <Input
                  id="session-title"
                  value={captureTitle}
                  onChange={(event) => setCaptureTitle(event.target.value)}
                  placeholder="Family Engagement Security Sprint"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="session-source">Source</Label>
                <Input
                  id="session-source"
                  value={captureSource}
                  onChange={(event) => setCaptureSource(event.target.value)}
                  placeholder="gemini | claude | chatgpt | manual"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="session-content">Transcript content</Label>
              <Textarea
                id="session-content"
                value={captureContent}
                onChange={(event) => setCaptureContent(event.target.value)}
                placeholder="Paste the full AI conversation here..."
                className="min-h-[200px]"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={() => void captureSession(false)} disabled={extracting}>
                <Upload className="h-4 w-4 mr-2" />
                {extracting ? 'Capturing...' : 'Capture & Extract'}
              </Button>
              <Button variant="outline" onClick={() => void captureSession(true)} disabled={extracting}>
                Reprocess Session
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-2xl font-semibold">{data.counts.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground">Open</p>
              <p className="text-2xl font-semibold">{data.counts.open}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground">Needs Triage</p>
              <p className="text-2xl font-semibold">{data.counts.triage}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground">Done</p>
              <p className="text-2xl font-semibold">{data.counts.done}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{heading}</CardTitle>
            <CardDescription>
              Prioritize unresolved items and move them through your execution workflow.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-3 md:items-end">
              <div className="flex gap-2">
                {VIEW_OPTIONS.map((option) => (
                  <Button
                    key={option.id}
                    variant={view === option.id ? 'default' : 'outline'}
                    onClick={() => setView(option.id)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>

              <div className="flex-1 md:max-w-sm">
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search title, tags, details..."
                />
              </div>

              <Button variant="outline" onClick={() => void loadWorkItems(view, search)}>
                Apply
              </Button>
            </div>

            {loading ? (
              <p className="text-sm text-muted-foreground">Loading work items...</p>
            ) : data.items.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No items found in this view. Capture a session above or create items through the API.
              </p>
            ) : (
              <div className="space-y-3">
                {data.items.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                      <div className="space-y-1">
                        <p className="font-medium leading-tight">{item.title}</p>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <span className={`px-2 py-0.5 rounded ${priorityClass(item.priority)}`}>
                            {item.priority}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
                            {item.type}
                          </span>
                          <span className={statusClass(item.status)}>
                            {item.status}
                          </span>
                        </div>
                        {item.tags && (
                          <p className="text-xs text-muted-foreground">tags: {item.tags}</p>
                        )}
                        {item.sourcePath && (
                          <p className="text-xs text-muted-foreground">
                            source: {item.sourcePath}
                            {item.sourceLineStart ? `:${item.sourceLineStart}` : ''}
                          </p>
                        )}
                        {item.session && (
                          <p className="text-xs text-muted-foreground">
                            session: {item.session.title} ({item.session.source})
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          className="rounded-md border bg-background px-2 py-1 text-sm"
                          value={item.status}
                          onChange={(event) => void updateStatus(item.id, event.target.value as WorkItemStatus)}
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                        {(item.type === 'PROMPT' || item.type === 'TASK' || item.type === 'QUESTION') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => void promoteToPrompt(item.id)}
                            disabled={promotingId === item.id}
                          >
                            <WandSparkles className="h-3.5 w-3.5 mr-1" />
                            {promotingId === item.id ? 'Promoting...' : 'Promote'}
                          </Button>
                        )}
                      </div>
                    </div>

                    {item.details && (
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{item.details}</p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock3 className="h-3.5 w-3.5" />
                        created: {new Date(item.createdAt).toLocaleString()}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        follow-ups: {item.followUps.length}
                      </div>
                    </div>

                    {item.nextAction && (
                      <div className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-500" />
                        <span>{item.nextAction}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {message && <p className="text-sm text-emerald-600 dark:text-emerald-400">{message}</p>}
      </div>
    </Layout>
  )
}
