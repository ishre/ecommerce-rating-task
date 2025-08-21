import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword, validatePassword, validateName, validateAddress, validateEmail } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, address } = await request.json()

    // Validation
    if (!name || !email || !password || !address) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (!validateName(name)) {
      return NextResponse.json(
        { error: 'Name must be between 2 and 60 characters' },
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
        role: 'NORMAL_USER'
      }
    })

    return NextResponse.json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
