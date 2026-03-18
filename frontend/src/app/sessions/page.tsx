'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { WandSparkles } from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

type SessionSummary = {
  id: string
  title: string
  source: string
  source_path: string | null
  extracted_at: string | null
  created_at: string
  updated_at: string
  work_items_count: number
  triage_count: number
  open_count: number
  done_count: number
}

type SessionListResponse = {
  sessions: SessionSummary[]
  total: number
  skip: number
  limit: number
}

type SessionWorkItemStatus = 'TRIAGE' | 'OPEN' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE'
type SessionWorkItemType = 'TASK' | 'PROMPT' | 'QUESTION' | 'DECISION' | 'RISK'

type SessionDetail = {
  id: string
  title: string
  source: string
  source_path: string | null
  raw_content: string | null
  extracted_at: string | null
  created_at: string
  updated_at: string
  counts: {
    total: number
    triage: number
    open: number
    done: number
  }
  work_items: Array<{
    id: string
    title: string
    details: string | null
    type: SessionWorkItemType
    status: SessionWorkItemStatus
    priority: string
    tags: string | null
    next_action: string | null
    linked_prompts: Array<{
      prompt_id: string
      prompt_title: string
      link_type: string
    }>
  }>
}

const EMPTY_LIST: SessionListResponse = {
  sessions: [],
  total: 0,
  skip: 0,
  limit: 20,
}

const STATUS_OPTIONS: SessionWorkItemStatus[] = [
  'TRIAGE',
  'OPEN',
  'IN_PROGRESS',
  'BLOCKED',
  'DONE',
]

function statusBadgeClass(status: SessionWorkItemStatus): string {
  if (status === 'DONE') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
  if (status === 'TRIAGE') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
  if (status === 'BLOCKED') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
  if (status === 'IN_PROGRESS') return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
  return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300'
}

function canPromoteItem(type: SessionWorkItemType): boolean {
  return type === 'PROMPT' || type === 'TASK' || type === 'QUESTION'
}

export default function SessionsPage() {
  const [list, setList] = useState<SessionListResponse>(EMPTY_LIST)
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [detail, setDetail] = useState<SessionDetail | null>(null)
  const [search, setSearch] = useState('')
  const [source, setSource] = useState('')
  const [loadingList, setLoadingList] = useState(true)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null)
  const [promotingItemId, setPromotingItemId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function loadSessions(nextSearch = search, nextSource = source) {
    setLoadingList(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (nextSearch.trim()) params.set('search', nextSearch.trim())
      if (nextSource.trim()) params.set('source', nextSource.trim())
      params.set('limit', '50')

      const res = await fetch(`/api/v1/sessions?${params.toString()}`)
      const payload = (await res.json()) as SessionListResponse & { error?: string }

      if (!res.ok) {
        throw new Error(payload.error || 'Failed to load sessions.')
      }

      setList(payload)
      if (!selectedSessionId && payload.sessions.length > 0) {
        setSelectedSessionId(payload.sessions[0].id)
      } else if (
        selectedSessionId &&
        !payload.sessions.some((session) => session.id === selectedSessionId)
      ) {
        setSelectedSessionId(payload.sessions.length > 0 ? payload.sessions[0].id : null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions.')
    } finally {
      setLoadingList(false)
    }
  }

  async function loadSessionDetail(sessionId: string) {
    setLoadingDetail(true)
    setError(null)

    try {
      const res = await fetch(`/api/v1/sessions/${sessionId}`)
      const payload = (await res.json()) as SessionDetail & { error?: string }

      if (!res.ok) {
        throw new Error(payload.error || 'Failed to load session detail.')
      }

      setDetail(payload)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load session detail.')
      setDetail(null)
    } finally {
      setLoadingDetail(false)
    }
  }

  async function updateWorkItemStatus(workItemId: string, status: SessionWorkItemStatus) {
    setUpdatingItemId(workItemId)
    setError(null)
    setMessage(null)

    try {
      const res = await fetch(`/api/v1/work-items/${workItemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const payload = (await res.json()) as { error?: string }

      if (!res.ok) {
        throw new Error(payload.error || 'Failed to update work item.')
      }

      setMessage('Work item updated.')
      if (selectedSessionId) {
        await Promise.all([
          loadSessionDetail(selectedSessionId),
          loadSessions(search, source),
        ])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update work item.')
    } finally {
      setUpdatingItemId(null)
    }
  }

  async function promoteWorkItem(workItemId: string) {
    setPromotingItemId(workItemId)
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
      if (selectedSessionId) {
        await Promise.all([
          loadSessionDetail(selectedSessionId),
          loadSessions(search, source),
        ])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to promote work item.')
    } finally {
      setPromotingItemId(null)
    }
  }

  useEffect(() => {
    void loadSessions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (selectedSessionId) {
      void loadSessionDetail(selectedSessionId)
    } else {
      setDetail(null)
    }
  }, [selectedSessionId])

  const selectedSummary = useMemo(
    () => list.sessions.find((session) => session.id === selectedSessionId) || null,
    [list.sessions, selectedSessionId]
  )

  return (
    <Layout>
      <div className="container mx-auto py-6 px-4 max-w-7xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sessions</h1>
          <p className="text-muted-foreground mt-2">
            Browse captured AI conversation sessions and track extraction outcomes.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Session List</CardTitle>
              <CardDescription>
                Filter and select a session to inspect transcript and extracted work items.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="session-search">Search</Label>
                <Input
                  id="session-search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search title or path..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="session-source">Source</Label>
                <Input
                  id="session-source"
                  value={source}
                  onChange={(event) => setSource(event.target.value)}
                  placeholder="gemini | claude | manual"
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => void loadSessions(search, source)}>
                  Apply
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch('')
                    setSource('')
                    void loadSessions('', '')
                  }}
                >
                  Reset
                </Button>
              </div>

              {loadingList ? (
                <p className="text-sm text-muted-foreground">Loading sessions...</p>
              ) : list.sessions.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No sessions found yet. Capture one from `/work-items`.
                </p>
              ) : (
                <div className="space-y-2 max-h-[540px] overflow-y-auto pr-1">
                  {list.sessions.map((session) => {
                    const isActive = session.id === selectedSessionId
                    return (
                      <button
                        key={session.id}
                        type="button"
                        onClick={() => setSelectedSessionId(session.id)}
                        className={`w-full text-left rounded-md border p-3 transition ${
                          isActive
                            ? 'border-oro-orange-400 bg-oro-orange-50 dark:bg-oro-orange-950/20'
                            : 'hover:bg-accent'
                        }`}
                      >
                        <p className="text-sm font-medium line-clamp-2">{session.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {session.source} • {new Date(session.created_at).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          items: {session.work_items_count} • triage: {session.triage_count} • open: {session.open_count}
                        </p>
                      </button>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{selectedSummary?.title || 'Session Detail'}</CardTitle>
              <CardDescription>
                Inspect transcript context and linked work items/promoted prompts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingDetail ? (
                <p className="text-sm text-muted-foreground">Loading session detail...</p>
              ) : !detail ? (
                <p className="text-sm text-muted-foreground">Select a session from the list.</p>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{detail.source}</Badge>
                    <Badge variant="outline">total {detail.counts.total}</Badge>
                    <Badge variant="outline">triage {detail.counts.triage}</Badge>
                    <Badge variant="outline">open {detail.counts.open}</Badge>
                    <Badge variant="outline">done {detail.counts.done}</Badge>
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>created: {new Date(detail.created_at).toLocaleString()}</p>
                    <p>updated: {new Date(detail.updated_at).toLocaleString()}</p>
                    {detail.source_path && <p>source path: {detail.source_path}</p>}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">Transcript</h3>
                      <Link href="/work-items" className="text-xs text-oro-orange-600 hover:underline">
                        Open Work Items
                      </Link>
                    </div>
                    <pre className="max-h-[220px] overflow-auto rounded-md border bg-muted/60 p-3 text-xs whitespace-pre-wrap">
                      {detail.raw_content || 'No transcript content stored.'}
                    </pre>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Extracted Work Items</h3>
                    {detail.work_items.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No work items extracted for this session.</p>
                    ) : (
                      <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                        {detail.work_items.map((item) => (
                          <div key={item.id} className="rounded-md border p-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-medium">{item.title}</p>
                              <span className={`px-2 py-0.5 rounded text-[10px] ${statusBadgeClass(item.status)}`}>
                                {item.status}
                              </span>
                              <Badge variant="outline" className="text-[10px]">{item.type}</Badge>
                              <Badge variant="outline" className="text-[10px]">{item.priority}</Badge>
                            </div>
                            {item.tags && (
                              <p className="text-xs text-muted-foreground mt-1">tags: {item.tags}</p>
                            )}
                            {item.next_action && (
                              <p className="text-xs text-muted-foreground mt-1">
                                next: {item.next_action}
                              </p>
                            )}
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <select
                                className="rounded-md border bg-background px-2 py-1 text-xs"
                                value={item.status}
                                disabled={updatingItemId === item.id}
                                onChange={(event) => void updateWorkItemStatus(
                                  item.id,
                                  event.target.value as SessionWorkItemStatus
                                )}
                              >
                                {STATUS_OPTIONS.map((status) => (
                                  <option key={`${item.id}-${status}`} value={status}>
                                    {status}
                                  </option>
                                ))}
                              </select>
                              {canPromoteItem(item.type) && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => void promoteWorkItem(item.id)}
                                  disabled={promotingItemId === item.id}
                                >
                                  <WandSparkles className="h-3.5 w-3.5 mr-1" />
                                  {promotingItemId === item.id ? 'Promoting...' : 'Promote'}
                                </Button>
                              )}
                            </div>
                            {item.linked_prompts.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {item.linked_prompts.map((link) => (
                                  <Link
                                    key={`${item.id}-${link.prompt_id}`}
                                    href={`/prompts/${link.prompt_id}/edit`}
                                    className="text-xs rounded border px-2 py-1 hover:bg-accent"
                                  >
                                    prompt: {link.prompt_title}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {message && <p className="text-sm text-emerald-600 dark:text-emerald-400">{message}</p>}
      </div>
    </Layout>
  )
}
