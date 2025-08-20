import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== 'NORMAL_USER') {
      return NextResponse.json(
        { error: 'Only normal users can submit ratings' },
        { status: 403 }
      )
    }

    const { storeId, rating } = await request.json()

    if (!storeId || !rating) {
      return NextResponse.json(
        { error: 'Store ID and rating are required' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return NextResponse.json(
        { error: 'Rating must be an integer between 1 and 5' },
        { status: 400 }
      )
    }

    // Check if store exists
    const store = await prisma.store.findUnique({
      where: { id: storeId }
    })

    if (!store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      )
    }

    // Check if user already rated this store
    const existingRating = await prisma.rating.findUnique({
      where: {
        userId_storeId: {
          userId: payload.userId,
          storeId
        }
      }
    })

    let result
    if (existingRating) {
      // Update existing rating
      result = await prisma.rating.update({
        where: {
          userId_storeId: {
            userId: payload.userId,
            storeId
          }
        },
        data: { rating }
      })
    } else {
      // Create new rating
      result = await prisma.rating.create({
        data: {
          userId: payload.userId,
          storeId,
          rating
        }
      })
    }

    return NextResponse.json({
      message: existingRating ? 'Rating updated successfully' : 'Rating submitted successfully',
      rating: result
    })
  } catch (error) {
    console.error('Submit rating error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('storeId')
    const userId = searchParams.get('userId')

    if (payload.role === 'STORE_OWNER' && storeId) {
      // Store owner viewing ratings for their store
      const ratings = await prisma.rating.findMany({
        where: { storeId },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              address: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      return NextResponse.json(ratings)
    } else if (payload.role === 'NORMAL_USER' && storeId) {
      // Normal user viewing their rating for a specific store
      const rating = await prisma.rating.findUnique({
        where: {
          userId_storeId: {
            userId: payload.userId,
            storeId
          }
        }
      })

      return NextResponse.json(rating || { rating: null })
    }

    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Get ratings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
