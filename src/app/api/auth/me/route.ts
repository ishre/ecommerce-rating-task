import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken, comparePassword, hashPassword, validateAddress, validateName, validatePassword } from '@/lib/auth'

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
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        address: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
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
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, address, currentPassword, newPassword } = body as {
      name?: string
      address?: string
      currentPassword?: string
      newPassword?: string
    }

    if (!name && !address && !newPassword) {
      return NextResponse.json(
        { error: 'No changes provided' },
        { status: 400 }
      )
    }

    // Fetch current user
    const user = await prisma.user.findUnique({ where: { id: payload.userId } })
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const updateData: { name?: string; address?: string; password?: string } = {}

    if (typeof name === 'string') {
      if (!validateName(name)) {
        return NextResponse.json(
          { error: 'Name must be between 2 and 60 characters' },
          { status: 400 }
        )
      }
      updateData.name = name
    }

    if (typeof address === 'string') {
      if (!validateAddress(address)) {
        return NextResponse.json(
          { error: 'Address must be 400 characters or less' },
          { status: 400 }
        )
      }
      updateData.address = address
    }

    if (typeof newPassword === 'string') {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Current password is required to change password' },
          { status: 400 }
        )
      }

      const matches = await comparePassword(currentPassword, user.password)
      if (!matches) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        )
      }

      if (!validatePassword(newPassword)) {
        return NextResponse.json(
          { error: 'Password must be 8-16 characters with at least one uppercase letter and one special character' },
          { status: 400 }
        )
      }

      updateData.password = await hashPassword(newPassword)
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, address: true }
    })

    return NextResponse.json({ user: updated })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
