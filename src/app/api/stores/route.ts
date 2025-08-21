import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const name = searchParams.get('name')
    const address = searchParams.get('address')
    const sortBy = searchParams.get('sortBy') || 'name'
    const sortOrder = searchParams.get('sortOrder') || 'asc'

    const where: Record<string, { contains: string; mode: 'insensitive' }> = {}
    if (name) {
      where.name = { contains: name, mode: 'insensitive' }
    }
    if (address) {
      where.address = { contains: address, mode: 'insensitive' }
    }

    const stores = await prisma.store.findMany({
      where,
      include: {
        owner: {
          select: {
            name: true,
            email: true
          }
        },
        ratings: {
          select: {
            rating: true
          }
        }
      },
      orderBy: {
        [sortBy]: sortOrder
      }
    })

    const storesWithRating = stores.map(store => {
      const totalRating = store.ratings.reduce((sum, r) => sum + r.rating, 0)
      const averageRating = store.ratings.length > 0 ? totalRating / store.ratings.length : 0
      
      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        ownerName: store.owner.name,
        ownerEmail: store.owner.email,
        averageRating: Math.round(averageRating * 100) / 100,
        totalRatings: store.ratings.length
      }
    })

    return NextResponse.json(storesWithRating)
  } catch (error) {
    console.error('Get stores error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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
    if (!payload || payload.role !== 'SYSTEM_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const { name, email, address, ownerId } = await request.json()

    if (!name || !email || !address || !ownerId) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Check if owner exists and is a store owner
    const owner = await prisma.user.findUnique({
      where: { id: ownerId }
    })

    if (!owner || owner.role !== 'STORE_OWNER') {
      return NextResponse.json(
        { error: 'Owner must be a store owner' },
        { status: 400 }
      )
    }

    // Check if store with email already exists
    const existingStore = await prisma.store.findUnique({
      where: { email }
    })

    if (existingStore) {
      return NextResponse.json(
        { error: 'Store with this email already exists' },
        { status: 409 }
      )
    }

    const store = await prisma.store.create({
      data: {
        name,
        email,
        address,
        ownerId
      },
      include: {
        owner: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Store created successfully',
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        ownerName: store.owner.name,
        ownerEmail: store.owner.email
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Create store error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
