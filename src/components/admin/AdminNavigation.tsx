'use client'

import React from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart3, Users, Building2 } from 'lucide-react'

interface AdminNavigationProps {
  activeTab: 'dashboard' | 'users' | 'stores'
  onTabChange: (tab: 'dashboard' | 'users' | 'stores') => void
}

export const AdminNavigation: React.FC<AdminNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as 'dashboard' | 'users' | 'stores')} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/50 dark:bg-slate-800/50">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Users</span>
            </TabsTrigger>
            <TabsTrigger value="stores" className="flex items-center space-x-2">
              <Building2 className="h-4 w-4" />
              <span>Stores</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </nav>
  )
}
