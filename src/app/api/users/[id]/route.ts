import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken, validateAddress, validateEmail, validateName } from '@/lib/auth'

export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== 'SYSTEM_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const url = new URL(request.url)
    const segments = url.pathname.split('/')
    const userId = segments[segments.length - 2] === '[id]'
      ? segments[segments.length - 1]
      : segments[segments.length - 1]
    const { name, email, address, role } = await request.json() as {
      name?: string
      email?: string
      address?: string
      role?: 'SYSTEM_ADMIN' | 'NORMAL_USER' | 'STORE_OWNER'
    }

    if (!name && !email && !address && !role) {
      return NextResponse.json({ error: 'No changes provided' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}

    if (typeof name === 'string') {
      if (!validateName(name)) return NextResponse.json({ error: 'Name must be between 2 and 60 characters' }, { status: 400 })
      updateData.name = name
    }
    if (typeof email === 'string') {
      if (!validateEmail(email)) return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
      updateData.email = email
    }
    if (typeof address === 'string') {
      if (!validateAddress(address)) return NextResponse.json({ error: 'Address must be 400 characters or less' }, { status: 400 })
      updateData.address = address
    }
    if (role) {
      if (!['SYSTEM_ADMIN', 'NORMAL_USER', 'STORE_OWNER'].includes(role)) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
      }
      updateData.role = role
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, name: true, email: true, address: true, role: true, createdAt: true }
    })

    return NextResponse.json({ user: updated })
  } catch (error) {
    console.error('Admin update user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


