import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken, hashPassword, validatePassword, validateName, validateAddress, validateEmail } from '@/lib/auth'

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

    const { searchParams } = new URL(request.url)
    const name = searchParams.get('name')
    const email = searchParams.get('email')
    const address = searchParams.get('address')
    const role = searchParams.get('role')
    const sortBy = searchParams.get('sortBy') || 'name'
    const sortOrder = searchParams.get('sortOrder') || 'asc'

    const where: any = {}
    if (name) {
      where.name = { contains: name, mode: 'insensitive' }
    }
    if (email) {
      where.email = { contains: email, mode: 'insensitive' }
    }
    if (address) {
      where.address = { contains: address, mode: 'insensitive' }
    }
    if (role) {
      where.role = role
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
        ownedStores: {
          select: {
            ratings: {
              select: {
                rating: true
              }
            }
          }
        }
      },
      orderBy: {
        [sortBy]: sortOrder
      }
    })

    const usersWithRating = users.map(user => {
      let averageRating = 0
      if (user.role === 'STORE_OWNER' && user.ownedStores.length > 0) {
        const allRatings = user.ownedStores.flatMap(store => store.ratings)
        if (allRatings.length > 0) {
          const totalRating = allRatings.reduce((sum, r) => sum + r.rating, 0)
          averageRating = Math.round((totalRating / allRatings.length) * 100) / 100
        }
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
        createdAt: user.createdAt,
        averageRating: user.role === 'STORE_OWNER' ? averageRating : null
      }
    })

    return NextResponse.json(usersWithRating)
  } catch (error) {
    console.error('Get users error:', error)
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

    const { name, email, password, address, role } = await request.json()

    // Validation
    if (!name || !email || !password || !address || !role) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (!validateName(name)) {
      return NextResponse.json(
        { error: 'Name must be between 20 and 60 characters' },
        { status: 400 }
      )
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    if (!validatePassword(password)) {
      return NextResponse.json(
        { error: 'Password must be 8-16 characters with at least one uppercase letter and one special character' },
        { status: 400 }
      )
    }

    if (!validateAddress(address)) {
      return NextResponse.json(
        { error: 'Address must be 400 characters or less' },
        { status: 400 }
      )
    }

    if (!['SYSTEM_ADMIN', 'NORMAL_USER', 'STORE_OWNER'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        address,
        role
      }
    })

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
