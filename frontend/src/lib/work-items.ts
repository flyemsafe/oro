import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import {
  FollowUpStatus,
  Prisma,
  WorkItemPriority,
  WorkItemStatus,
  WorkItemType,
} from '@prisma/client'
import { prisma } from '@/lib/prisma'

export interface WorkItemsQueryInput {
  view?: 'open' | 'triage' | 'all'
  search?: string
  status?: WorkItemStatus
  limit?: number
}

export interface ExtractSessionInput {
  source?: string
  title?: string
  sourcePath?: string
  content?: string
  force?: boolean
}

interface ParsedBlock {
  title: string
  body: string
  startLine: number
  endLine: number
}

function getRepoRoot(): string {
  const cwd = process.cwd()
  if (path.basename(cwd) === 'frontend') {
    return path.resolve(cwd, '..')
  }
  return cwd
}

function resolveSourcePath(sourcePath?: string): string {
  const candidate = sourcePath?.trim()
  if (!candidate) {
    return ''
  }
  if (path.isAbsolute(candidate)) {
    return candidate
  }
  return path.resolve(getRepoRoot(), candidate)
}

function computeSourceHash(content: string, sourcePath: string): string {
  return crypto
    .createHash('sha256')
    .update(sourcePath)
    .update('\n')
    .update(content)
    .digest('hex')
}

function inferWorkItemType(title: string, body: string): WorkItemType {
  const text = `${title}\n${body}`.toLowerCase()
  const normalizedTitle = title.toLowerCase()

  if (normalizedTitle.includes('prompt')) {
    return WorkItemType.PROMPT
  }

  if (
    text.includes('risk') ||
    text.includes('security') ||
    text.includes('attack') ||
    text.includes('abuse') ||
    text.includes('prompt injection') ||
    text.includes('runaway bill')
  ) {
    return WorkItemType.RISK
  }

  if (
    text.includes('would you like') ||
    text.includes('should we') ||
    text.includes('do we') ||
    title.includes('?')
  ) {
    return WorkItemType.QUESTION
  }

  if (
    text.includes('decision') ||
    text.includes('choose') ||
    text.includes('tradeoff') ||
    text.includes('under the hood')
  ) {
    return WorkItemType.DECISION
  }

  if (
    text.includes('feed this exact prompt') ||
    text.includes('template prompt') ||
    text.includes('copy this prompt')
  ) {
    return WorkItemType.PROMPT
  }

  return WorkItemType.TASK
}

function inferPriority(title: string, body: string): WorkItemPriority {
  const text = `${title}\n${body}`.toLowerCase()

  if (
    text.includes('runaway bill') ||
    text.includes('massive api bill') ||
    text.includes('prompt injection')
  ) {
    return WorkItemPriority.URGENT
  }

  if (
    text.includes('must') ||
    text.includes('never') ||
    text.includes('required') ||
    text.includes('strict')
  ) {
    return WorkItemPriority.HIGH
  }

  if (text.includes('optional') || text.includes('nice to have')) {
    return WorkItemPriority.LOW
  }

  return WorkItemPriority.MEDIUM
}

function inferNextAction(body: string): string | null {
  const lines = body
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  const bullet = lines.find((line) => line.startsWith('- ') || line.startsWith('* '))
  if (bullet) {
    return bullet.replace(/^[-*]\s+/, '').slice(0, 280)
  }

  const sentence = lines.find((line) => line.length > 20)
  return sentence ? sentence.slice(0, 280) : null
}

function inferTags(type: WorkItemType, title: string, body: string): string | null {
  const tags = new Set<string>([type.toLowerCase()])
  const text = `${title}\n${body}`.toLowerCase()

  if (text.includes('security') || text.includes('prompt injection')) {
    tags.add('security')
  }
  if (text.includes('token') || text.includes('cost') || text.includes('billing')) {
    tags.add('cost-control')
  }
  if (text.includes('blog')) {
    tags.add('blog')
  }
  if (text.includes('api')) {
    tags.add('api')
  }
  if (text.includes('schema')) {
    tags.add('schema')
  }

  const tagList = Array.from(tags)
  return tagList.length > 0 ? tagList.join(',') : null
}

function toWorkItemTitle(blockTitle: string, blockBody: string): string {
  const trimmed = blockTitle.trim()
  if (trimmed.length > 0) {
    return trimmed.slice(0, 180)
  }

  const firstSentence = blockBody
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line.length > 10)

  return (firstSentence || 'Untitled extracted item').slice(0, 180)
}

function parseMarkdownBlocks(content: string): ParsedBlock[] {
  const lines = content.split('\n')
  const headings: Array<{ index: number; title: string }> = []

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]
    const match = line.match(/^#{2,6}\s+(.+?)\s*$/)
    if (match) {
      headings.push({
        index: i,
        title: match[1].trim(),
      })
    }
  }

  if (headings.length === 0) {
    return [
      {
        title: 'Session Notes',
        body: content.trim(),
        startLine: 1,
        endLine: lines.length,
      },
    ]
  }

  const blocks: ParsedBlock[] = []
  const firstHeading = headings[0]

  if (firstHeading.index > 0) {
    const intro = lines.slice(0, firstHeading.index).join('\n').trim()
    if (intro) {
      blocks.push({
        title: 'Session Overview',
        body: intro,
        startLine: 1,
        endLine: firstHeading.index,
      })
    }
  }

  for (let i = 0; i < headings.length; i += 1) {
    const current = headings[i]
    const next = headings[i + 1]
    const start = current.index + 1
    const end = next ? next.index : lines.length
    const body = lines.slice(start, end).join('\n').trim()

    if (!body) {
      continue
    }

    blocks.push({
      title: current.title,
      body,
      startLine: current.index + 1,
      endLine: end,
    })
  }

  return blocks
}

function buildWhere(query: WorkItemsQueryInput): Prisma.WorkItemWhereInput {
  const where: Prisma.WorkItemWhereInput = {}

  if (query.status) {
    where.status = query.status
  } else if (query.view === 'triage') {
    where.status = WorkItemStatus.TRIAGE
  } else if (query.view === 'open') {
    where.status = {
      in: [WorkItemStatus.OPEN, WorkItemStatus.IN_PROGRESS, WorkItemStatus.BLOCKED],
    }
  }

  const search = query.search?.trim()
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { details: { contains: search } },
      { sourcePath: { contains: search } },
      { tags: { contains: search } },
    ]
  }

  return where
}

export async function listWorkItems(query: WorkItemsQueryInput) {
  const where = buildWhere(query)
  const take = Math.min(Math.max(query.limit || 50, 1), 250)

  const [items, triageCount, openCount, doneCount, totalCount] = await Promise.all([
    prisma.workItem.findMany({
      where,
      include: {
        session: {
          select: {
            id: true,
            title: true,
            source: true,
            sourcePath: true,
          },
        },
        followUps: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
      orderBy: [
        { priority: 'desc' },
        { dueAt: 'asc' },
        { createdAt: 'desc' },
      ],
      take,
    }),
    prisma.workItem.count({ where: { status: WorkItemStatus.TRIAGE } }),
    prisma.workItem.count({
      where: {
        status: {
          in: [WorkItemStatus.OPEN, WorkItemStatus.IN_PROGRESS, WorkItemStatus.BLOCKED],
        },
      },
    }),
    prisma.workItem.count({ where: { status: WorkItemStatus.DONE } }),
    prisma.workItem.count(),
  ])

  return {
    items,
    counts: {
      triage: triageCount,
      open: openCount,
      done: doneCount,
      total: totalCount,
    },
  }
}

export async function extractSessionToWorkItems(input: ExtractSessionInput) {
  const sourcePath = resolveSourcePath(input.sourcePath)
  const hasSourcePath = sourcePath.length > 0
  const content = input.content ?? (hasSourcePath ? fs.readFileSync(sourcePath, 'utf8') : '')

  if (!content.trim()) {
    throw new Error('Session content is required (or provide a source path).')
  }

  const sourceHash = computeSourceHash(content, sourcePath || 'inline-session')

  const existing = await prisma.session.findUnique({
    where: { sourceHash },
    include: {
      _count: {
        select: { workItems: true },
      },
    },
  })

  if (existing && !input.force) {
    return {
      sessionId: existing.id,
      sourcePath: hasSourcePath ? sourcePath : null,
      createdCount: 0,
      totalCount: existing._count.workItems,
      reused: true,
    }
  }

  const session = existing
    ? await prisma.session.update({
        where: { id: existing.id },
        data: {
          title: input.title || existing.title,
          source: input.source || existing.source,
          sourcePath: hasSourcePath ? sourcePath : null,
          rawContent: content,
          extractedAt: new Date(),
          workItems: {
            deleteMany: {},
          },
        },
      })
    : await prisma.session.create({
        data: {
          title:
            input.title ||
            (hasSourcePath
              ? path.basename(sourcePath).replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ')
              : 'Captured Session'),
          source: input.source || 'manual',
          sourcePath: hasSourcePath ? sourcePath : null,
          sourceHash,
          rawContent: content,
          extractedAt: new Date(),
        },
      })

  const blocks = parseMarkdownBlocks(content)
    .map((block) => ({
      ...block,
      title: toWorkItemTitle(block.title, block.body),
    }))
    .filter((block) => block.body.length >= 30)

  if (blocks.length === 0) {
    return {
      sessionId: session.id,
      sourcePath: hasSourcePath ? sourcePath : null,
      createdCount: 0,
      totalCount: 0,
      reused: false,
    }
  }

  const createdItems = await prisma.$transaction(
    blocks.map((block) => {
      const type = inferWorkItemType(block.title, block.body)
      const nextAction = inferNextAction(block.body)

      return prisma.workItem.create({
        data: {
          sessionId: session.id,
          title: block.title,
          details: block.body.slice(0, 4000),
          sourcePath: hasSourcePath ? sourcePath : null,
          sourceLineStart: block.startLine,
          sourceLineEnd: block.endLine,
          sourceExcerpt: block.body.slice(0, 500),
          type,
          status: WorkItemStatus.TRIAGE,
          priority: inferPriority(block.title, block.body),
          tags: inferTags(type, block.title, block.body),
          nextAction,
          followUps: nextAction
            ? {
                create: [
                  {
                    title: nextAction.slice(0, 180),
                    status: FollowUpStatus.OPEN,
                  },
                ],
              }
            : undefined,
        },
      })
    })
  )

  return {
      sessionId: session.id,
      sourcePath: hasSourcePath ? sourcePath : null,
      createdCount: createdItems.length,
      totalCount: createdItems.length,
      reused: false,
  }
}
