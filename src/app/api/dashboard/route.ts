import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

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
    if (!payload || payload.role !== 'SYSTEM_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Get counts
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      prisma.user.count(),
      prisma.store.count(),
      prisma.rating.count()
    ])

    // Get recent activity
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    })

    const recentStores = await prisma.store.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        createdAt: true,
        owner: {
          select: {
            name: true
          }
        }
      }
    })

    const recentRatings = await prisma.rating.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        rating: true,
        createdAt: true,
        user: {
          select: {
            name: true
          }
        },
        store: {
          select: {
            name: true
          }
        }
      }
    })

    // Compute top rated stores (by average rating, then by rating count)
    const storesForRatings = await prisma.store.findMany({
      select: {
        id: true,
        name: true,
        ratings: { select: { rating: true } }
      }
    })

    const topRatedStores = storesForRatings
      .map((store) => {
        const total = store.ratings.reduce((sum, r) => sum + r.rating, 0)
        const count = store.ratings.length
        const avg = count > 0 ? total / count : 0
        return {
          id: store.id,
          name: store.name,
          averageRating: Math.round(avg * 100) / 100,
          totalRatings: count,
        }
      })
      .filter((s) => s.totalRatings > 0)
      .sort((a, b) => {
        if (b.averageRating !== a.averageRating) return b.averageRating - a.averageRating
        return b.totalRatings - a.totalRatings
      })
      .slice(0, 3)

    return NextResponse.json({
      stats: {
        totalUsers,
        totalStores,
        totalRatings
      },
      recentActivity: {
        users: recentUsers,
        stores: recentStores,
        ratings: recentRatings
      },
      topRatedStores
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
