'use client'

import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { AdminDashboard } from '@/components/AdminDashboard'
import { UserDashboard } from '@/components/UserDashboard'
import { StoreOwnerDashboard } from '@/components/StoreOwnerDashboard'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    console.log('Dashboard: isLoading =', isLoading, 'user =', user)
    if (!isLoading && !user) {
      console.log('No user found, redirecting to /auth')
      router.push('/auth')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Route to appropriate dashboard based on user role
  switch (user.role) {
    case 'SYSTEM_ADMIN':
      return <AdminDashboard />
    case 'NORMAL_USER':
      return <UserDashboard />
    case 'STORE_OWNER':
      return <StoreOwnerDashboard />
    default:
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl text-red-600">Invalid user role</div>
        </div>
      )
  }
}
