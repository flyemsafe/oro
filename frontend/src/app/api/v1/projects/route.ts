import { NextRequest, NextResponse } from 'next/server'
import {
  addProject,
  loadProjectsConfig,
  removeProject,
} from '@/lib/projects-store'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const config = loadProjectsConfig()
    return NextResponse.json(config)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load projects.' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const project = addProject({
      name: body.name,
      projectPath: body.projectPath,
      notesDir: body.notesDir,
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add project.' },
      { status: 400 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const config = removeProject(body.projectId)
    return NextResponse.json(config)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to remove project.' },
      { status: 400 }
    )
  }
}
