import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { renderTemplateText } from '@/lib/prompt-utils'

export const runtime = 'nodejs'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const variables = body.variables && typeof body.variables === 'object'
      ? body.variables
      : {}

    const prompt = await prisma.prompt.findUnique({
      where: { id },
      select: {
        id: true,
        content: true,
      },
    })

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      )
    }

    const rendered = renderTemplateText(prompt.content, variables)
    return NextResponse.json({
      rendered_content: rendered.renderedContent,
      missing_variables: rendered.missingVariables,
      used_variables: rendered.usedVariables,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to render template.' },
      { status: 400 }
    )
  }
}
