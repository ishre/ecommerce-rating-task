'use client'

import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { AdminDashboardStats } from './admin/AdminDashboardStats'
import { AdminUsersTab } from './admin/AdminUsersTab'
import { AdminStoresTab } from './admin/AdminStoresTab'
import { AdminHeader } from './admin/AdminHeader'
import { AdminNavigation } from './admin/AdminNavigation'

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'stores'>('dashboard')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <AdminHeader user={user} />
      <AdminNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {activeTab === 'dashboard' && <AdminDashboardStats />}
        {activeTab === 'users' && <AdminUsersTab />}
        {activeTab === 'stores' && <AdminStoresTab />}
      </main>
    </div>
  )
}
