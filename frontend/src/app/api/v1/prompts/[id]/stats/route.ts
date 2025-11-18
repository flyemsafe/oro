/**
 * Prompt Statistics API Route
 *
 * GET /api/v1/prompts/[id]/stats - Get execution statistics for a prompt
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type RouteContext = {
  params: Promise<{ id: string }>
}

/**
 * GET /api/v1/prompts/[id]/stats
 * Get execution statistics for a prompt
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params

    // Check if prompt exists
    const prompt = await prisma.prompt.findUnique({
      where: { id },
      select: { id: true }
    })

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      )
    }

    // Get execution statistics
    const executions = await prisma.execution.findMany({
      where: { promptId: id },
      select: {
        rating: true,
        success: true,
        executedAt: true
      }
    })

    // Calculate statistics
    const totalExecutions = executions.length
    const successfulExecutions = executions.filter(e => e.success).length
    const ratingsGiven = executions.filter(e => e.rating !== null)
    const averageRating = ratingsGiven.length > 0
      ? ratingsGiven.reduce((sum, e) => sum + (e.rating || 0), 0) / ratingsGiven.length
      : null
    const successRate = totalExecutions > 0
      ? successfulExecutions / totalExecutions
      : 0
    const lastExecution = executions.length > 0
      ? executions.reduce((latest, e) =>
          e.executedAt > latest.executedAt ? e : latest
        ).executedAt
      : null

    const stats = {
      total_executions: totalExecutions,
      average_rating: averageRating ? Number(averageRating.toFixed(2)) : null,
      success_rate: Number(successRate.toFixed(2)),
      last_executed_at: lastExecution ? lastExecution.toISOString() : null
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching prompt stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch prompt statistics' },
      { status: 500 }
    )
  }
}
