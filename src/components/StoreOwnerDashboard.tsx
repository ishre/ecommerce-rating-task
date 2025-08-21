'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Star, Building2, LogOut, RefreshCw, TrendingUp, Users } from 'lucide-react'
import { ProfileDialog } from '@/components/ProfileDialog'
import { toast } from 'sonner'
import { TableSkeleton } from '@/components/ui/loading-skeleton'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'

interface StoreRating {
  id: string
  rating: number
  createdAt: string
  user: {
    name: string
    email: string
    address: string
  }
}

interface Store {
  id: string
  name: string
  email: string
  address: string
  averageRating: number | null
  totalRatings: number
  ownerEmail: string
}

export const StoreOwnerDashboard: React.FC = () => {
  const { user, logout } = useAuth()
  const [showProfile, setShowProfile] = useState(false)
  const [stores, setStores] = useState<Store[]>([])
  const [selectedStore, setSelectedStore] = useState<string | null>(null)
  const [storeRatings, setStoreRatings] = useState<StoreRating[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchUserStores()
  }, [])

  useEffect(() => {
    if (selectedStore) {
      fetchStoreRatings(selectedStore)
    }
  }, [selectedStore])

  const fetchUserStores = async () => {
    try {
      const response = await fetch('/api/stores')
      if (response.ok) {
        const allStores = await response.json()
        // Filter stores owned by the current user
        const userStores = allStores.filter((store: Store) => 
          store.ownerEmail === user?.email
        )
        setStores(userStores)
        
        if (userStores.length > 0 && !selectedStore) {
          setSelectedStore(userStores[0].id)
        }
      }
    } catch (error) {
      console.error('Failed to fetch user stores:', error)
      toast.error('Failed to fetch your stores')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStoreRatings = async (storeId: string) => {
    try {
      const response = await fetch(`/api/ratings?storeId=${storeId}`)
      if (response.ok) {
        const ratings = await response.json()
        setStoreRatings(ratings)
      }
    } catch (error) {
      console.error('Failed to fetch store ratings:', error)
      toast.error('Failed to fetch store ratings')
    }
  }

  const handleLogout = async () => {
    await logout()
  }

  if (isLoading) {
    return <TableSkeleton />
  }

  if (stores.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-white/20 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
                    Store Owner Dashboard
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Manage your store ratings and analytics
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-r from-green-500 to-blue-600 text-white">
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
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowProfile(true)}>Profile</Button>
              </div>
            </div>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Building2 className="h-10 w-10 text-blue-600" />
              </div>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                No Stores Found
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                You don&apos;t have any stores assigned to your account. Please contact an administrator to get started.
              </p>
              <Button
                onClick={fetchUserStores}
                variant="outline"
                className="border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const currentStore = stores.find(store => store.id === selectedStore)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
                  Store Owner Dashboard
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Manage your store ratings and analytics
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-r from-green-500 to-blue-600 text-white">
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
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowProfile(true)}>Profile</Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Store Selection */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-4 w-4" />
                <span>Select Store</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Label htmlFor="store-select" className="text-sm font-medium">
                  Store:
                </Label>
                <Select
                  value={selectedStore || ''}
                  onValueChange={(value) => setSelectedStore(value)}
                >
                  <SelectTrigger className="w-80">
                    <SelectValue placeholder="Select a store" />
                  </SelectTrigger>
                  <SelectContent>
                    {stores.map((store) => (
                      <SelectItem key={store.id} value={store.id}>
                        {store.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Store Overview */}
          {currentStore && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-sm">
                    <Building2 className="h-4 w-4" />
                    <span>Store Name</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-medium text-slate-900 dark:text-slate-100">
                    {currentStore.name}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-sm">
                    <Star className="h-4 w-4" />
                    <span>Average Rating</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <span className={cn("text-2xl font-bold", getRatingColor(currentStore.averageRating))}>
                      {currentStore.averageRating !== null && currentStore.averageRating !== undefined 
                        ? currentStore.averageRating.toFixed(2) 
                        : 'N/A'
                      }
                    </span>
                    <span className="text-sm text-slate-500">
                      / 5.0
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-sm">
                    <Users className="h-4 w-4" />
                    <span>Total Ratings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {currentStore.totalRatings}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Ratings List */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Store Ratings</CardTitle>
                  <CardDescription>
                    {storeRatings.length} ratings submitted for this store
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => selectedStore && fetchStoreRatings(selectedStore)}
                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {storeRatings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Star className="h-8 w-8 text-blue-600" />
                  </div>
                  <p className="text-slate-500 text-lg">No ratings yet for this store.</p>
                  <p className="text-slate-400 text-sm mt-2">Ratings will appear here once customers start rating your store.</p>
                </div>
              ) : (
                <div className="rounded-md border border-white/20">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/50 dark:bg-slate-700/50">
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {storeRatings.map((rating) => (
                        <TableRow key={rating.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50">
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs">
                                  {rating.user.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-slate-900 dark:text-slate-100">
                                  {rating.user.name}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                              {rating.user.email}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="truncate text-sm text-slate-600 dark:text-slate-400">
                              {rating.user.address}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className={cn("text-lg font-semibold", getRatingColor(rating.rating))}>
                                {rating.rating}
                              </span>
                              <span className="text-sm text-slate-500">/ 5</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                              {new Date(rating.createdAt).toLocaleDateString()}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
      <ProfileDialog open={showProfile} onOpenChange={setShowProfile} />
    </div>
  )
}

function getRatingColor(rating: number | null): string {
  if (!rating) return 'text-slate-400'
  if (rating >= 4) return 'text-green-600'
  if (rating >= 3) return 'text-yellow-600'
  return 'text-red-600'
}
