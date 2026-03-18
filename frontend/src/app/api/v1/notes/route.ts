import { NextRequest, NextResponse } from 'next/server'
import { createNotesEntry, getNotesContext, NotesEntryType } from '@/lib/notes-store'

export const runtime = 'nodejs'

function isValidType(value: string): value is NotesEntryType {
  return value === 'brain_dump' || value === 'note' || value === 'prompt' || value === 'thread'
}

export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get('projectId') || undefined
    const context = getNotesContext(projectId)
    return NextResponse.json(context)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to resolve notes context.' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const type = String(body.type || '')

    if (!isValidType(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Expected one of: brain_dump, note, prompt, thread.' },
        { status: 400 }
      )
    }

    const result = createNotesEntry({
      type,
      title: typeof body.title === 'string' ? body.title : undefined,
      tags: typeof body.tags === 'string' ? body.tags : undefined,
      content: typeof body.content === 'string' ? body.content : '',
      projectId: typeof body.projectId === 'string' ? body.projectId : undefined,
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create note entry.' },
      { status: 400 }
    )
  }
}
