'use client'

import React, { useState } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { BarChart3, LogOut } from 'lucide-react'
import { User } from '@/contexts/AuthContext'
import { ProfileDialog } from '@/components/ProfileDialog'

interface AdminHeaderProps {
  user: User | null
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ user }) => {
  const [showProfile, setShowProfile] = useState(false)
  const handleLogout = async () => {
    // This will be handled by the parent component
    window.location.href = '/auth'
  }

  return (
    <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-white/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Manage your platform with ease
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  {user?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {user?.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {user?.role}
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowProfile(true)}
              variant="outline"
              size="sm"
            >
              Profile
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
      <ProfileDialog open={showProfile} onOpenChange={setShowProfile} />
    </header>
  )
}
