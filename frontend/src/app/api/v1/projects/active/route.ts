import { NextRequest, NextResponse } from 'next/server'
import { setActiveProject } from '@/lib/projects-store'

export const runtime = 'nodejs'

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const config = setActiveProject(body.projectId)
    return NextResponse.json(config)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to set active project.' },
      { status: 400 }
    )
  }
}
