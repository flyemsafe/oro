import { NextRequest, NextResponse } from 'next/server'
import { extractSessionToWorkItems } from '@/lib/work-items'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = await extractSessionToWorkItems({
      source: typeof body.source === 'string' ? body.source : undefined,
      title: typeof body.title === 'string' ? body.title : undefined,
      sourcePath: typeof body.path === 'string' ? body.path : undefined,
      content: typeof body.content === 'string' ? body.content : undefined,
      force: Boolean(body.force),
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to extract work items.' },
      { status: 400 }
    )
  }
}
