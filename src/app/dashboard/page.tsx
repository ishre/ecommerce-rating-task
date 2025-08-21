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
    if (!isLoading && !user) {
      router.push('/auth')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
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
          <div className="text-center space-y-4">
            <div className="text-6xl">⚠️</div>
            <h1 className="text-2xl font-bold text-red-600">Invalid User Role</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Your account has an invalid role. Please contact an administrator.
            </p>
          </div>
        </div>
      )
  }
}
