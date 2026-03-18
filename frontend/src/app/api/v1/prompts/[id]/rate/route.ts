import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const rating = Number(body.rating)
    const success = body.success === undefined ? true : Boolean(body.success)
    const notes = typeof body.notes === 'string' ? body.notes : null

    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    const prompt = await prisma.prompt.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      )
    }

    await prisma.execution.create({
      data: {
        promptId: id,
        rating,
        success,
        notes,
      },
    })

    const ratings = await prisma.execution.findMany({
      where: { promptId: id, rating: { not: null } },
      select: { rating: true },
    })

    const values = ratings
      .map((entry) => entry.rating)
      .filter((value): value is number => typeof value === 'number')

    const average = values.length > 0
      ? Number((values.reduce((acc, current) => acc + current, 0) / values.length).toFixed(2))
      : null

    return NextResponse.json({
      average_rating: average,
      ratings_count: values.length,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to rate prompt.' },
      { status: 400 }
    )
  }
}
