/**
 * Individual Prompt API Routes
 *
 * GET    /api/v1/prompts/[id] - Get single prompt
 * PUT    /api/v1/prompts/[id] - Update prompt
 * DELETE /api/v1/prompts/[id] - Delete prompt
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type RouteContext = {
  params: Promise<{ id: string }>
}

/**
 * GET /api/v1/prompts/[id]
 * Get a single prompt by ID
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params

    const prompt = await prisma.prompt.findUnique({
      where: { id },
      include: {
        tags: {
          include: {
            tag: true
          }
        },
        executions: {
          select: {
            id: true,
            rating: true,
            success: true,
            notes: true,
            executedAt: true
          },
          orderBy: {
            executedAt: 'desc'
          }
        }
      }
    })

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      )
    }

    // Transform response
    const response = {
      id: prompt.id,
      name: prompt.name,
      content: prompt.content,
      system_prompt: prompt.systemPrompt,
      description: prompt.description,
      created_at: prompt.createdAt.toISOString(),
      updated_at: prompt.updatedAt.toISOString(),
      tags: prompt.tags.map(pt => pt.tag),
      executions: prompt.executions.map(e => ({
        id: e.id,
        rating: e.rating,
        success: e.success,
        notes: e.notes,
        executed_at: e.executedAt.toISOString()
      }))
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching prompt:', error)
    return NextResponse.json(
      { error: 'Failed to fetch prompt' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/v1/prompts/[id]
 * Update an existing prompt
 */
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const body = await request.json()

    const { name, content, system_prompt, description } = body

    // Check if prompt exists
    const existing = await prisma.prompt.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      )
    }

    // If name is being changed, check for duplicates
    if (name && name !== existing.name) {
      const duplicate = await prisma.prompt.findUnique({
        where: { name }
      })

      if (duplicate) {
        return NextResponse.json(
          { error: 'Prompt with this name already exists' },
          { status: 409 }
        )
      }
    }

    // Update prompt
    const prompt = await prisma.prompt.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(content && { content }),
        ...(system_prompt !== undefined && { systemPrompt: system_prompt }),
        ...(description !== undefined && { description })
      },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    // Transform response
    const response = {
      id: prompt.id,
      name: prompt.name,
      content: prompt.content,
      system_prompt: prompt.systemPrompt,
      description: prompt.description,
      created_at: prompt.createdAt.toISOString(),
      updated_at: prompt.updatedAt.toISOString(),
      tags: prompt.tags.map(pt => pt.tag)
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error updating prompt:', error)
    return NextResponse.json(
      { error: 'Failed to update prompt' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/v1/prompts/[id]
 * Delete a prompt
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params

    // Check if prompt exists
    const existing = await prisma.prompt.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      )
    }

    // Delete prompt (cascade will handle tags and executions)
    await prisma.prompt.delete({
      where: { id }
    })

    return NextResponse.json(
      { message: 'Prompt deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting prompt:', error)
    return NextResponse.json(
      { error: 'Failed to delete prompt' },
      { status: 500 }
    )
  }
}
