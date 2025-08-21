'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Filter, Star, Building2, LogOut, RefreshCw, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { toast } from 'sonner'
import { TableSkeleton } from '@/components/ui/loading-skeleton'
import { cn } from '@/lib/utils'
import { ProfileDialog } from '@/components/ProfileDialog'

interface Store {
  id: string
  name: string
  email: string
  address: string
  ownerName: string
  ownerEmail: string
  averageRating: number | null
  totalRatings: number
}

interface UserRating {
  rating: number | null
}

type SortField = 'name' | 'ownerName' | 'averageRating' | 'totalRatings'
type SortDirection = 'asc' | 'desc'

export const UserDashboard: React.FC = () => {
  const { user, logout } = useAuth()
  const [showProfile, setShowProfile] = useState(false)
  const [allStores, setAllStores] = useState<Store[]>([])
  const [userRatings, setUserRatings] = useState<Record<string, UserRating>>({})
  const [filters, setFilters] = useState({
    name: '',
    address: ''
  })
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [isLoading, setIsLoading] = useState(true)
  const [ratingStore, setRatingStore] = useState<string | null>(null)
  const [newRating, setNewRating] = useState(5)

  // Debounced filter effect
  useEffect(() => {
    const timer = setTimeout(() => {
      // This could trigger refetch if needed
    }, 300)

    return () => clearTimeout(timer)
  }, [filters])

  useEffect(() => {
    fetchStores()
  }, [])

  const fetchStores = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/stores')
      if (response.ok) {
        const storesData = await response.json()
        setAllStores(storesData)
        
        // Fetch user ratings for each store
        const ratings: Record<string, UserRating> = {}
        for (const store of storesData) {
          const ratingResponse = await fetch(`/api/ratings?storeId=${store.id}`)
          if (ratingResponse.ok) {
            const ratingData = await ratingResponse.json()
            ratings[store.id] = ratingData
          }
        }
        setUserRatings(ratings)
      }
    } catch (error) {
      console.error('Failed to fetch stores:', error)
      toast.error('Failed to fetch stores')
    } finally {
      setIsLoading(false)
    }
  }

  // Client-side filtering and sorting
  const filteredAndSortedStores = useMemo(() => {
    const filtered = allStores.filter(store => {
      const nameMatch = store.name.toLowerCase().includes(filters.name.toLowerCase())
      const addressMatch = store.address.toLowerCase().includes(filters.address.toLowerCase())
      
      return nameMatch && addressMatch
    })

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortField] as string | number | null
      let bValue = b[sortField] as string | number | null

      // Handle null values for rating
      if (sortField === 'averageRating') {
        aValue = aValue ?? 0
        bValue = bValue ?? 0
      }

      // Handle string sorting
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      let comparison = 0
      if (aValue !== null && bValue !== null) {
        if (aValue > bValue) comparison = 1
        if (aValue < bValue) comparison = -1
      } else if (aValue === null && bValue !== null) {
        comparison = -1
      } else if (aValue !== null && bValue === null) {
        comparison = 1
      }

      return sortDirection === 'desc' ? -comparison : comparison
    })

    return filtered
  }, [allStores, filters, sortField, sortDirection])

  // Handle sorting
  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }, [sortField])

  // Get sort icon
  const getSortIcon = useCallback((field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4" />
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-4 w-4" />
      : <ArrowDown className="h-4 w-4" />
  }, [sortField, sortDirection])

  const handleSubmitRating = async (storeId: string) => {
    try {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storeId,
          rating: newRating
        }),
      })

      if (response.ok) {
        toast.success('Rating submitted successfully!')
        // Update local state
        setUserRatings(prev => ({
          ...prev,
          [storeId]: { rating: newRating }
        }))
        
        // Refresh stores to update average ratings
        fetchStores()
        setRatingStore(null)
        setNewRating(5)
      } else {
        toast.error('Failed to submit rating')
      }
    } catch (error) {
      console.error('Failed to submit rating:', error)
      toast.error('Failed to submit rating')
    }
  }

  const handleLogout = async () => {
    await logout()
  }

  if (isLoading) {
    return <TableSkeleton />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
                  Store Ratings
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Rate and review stores on the platform
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
          {/* Search Filters */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="h-4 w-4" />
                  <span>Search & Filter</span>
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setFilters({ name: '', address: '' })}
                  className="text-slate-500 hover:text-slate-700"
                >
                  Clear Filters
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="store-name-search">Store Name</Label>
                  <Input
                    id="store-name-search"
                    placeholder="Search stores by name"
                    value={filters.name}
                    onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-white/50 dark:bg-slate-700/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store-address-search">Address</Label>
                  <Input
                    id="store-address-search"
                    placeholder="Search stores by address"
                    value={filters.address}
                    onChange={(e) => setFilters(prev => ({ ...prev, address: e.target.value }))}
                    className="bg-white/50 dark:bg-slate-700/50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stores Table */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Available Stores</CardTitle>
                  <CardDescription>
                    {filteredAndSortedStores.length} stores found
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchStores}
                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-white/20">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50 dark:bg-slate-700/50">
                      <TableHead 
                        className="cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-600/50 select-none"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Store</span>
                          {getSortIcon('name')}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-600/50 select-none"
                        onClick={() => handleSort('ownerName')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Owner</span>
                          {getSortIcon('ownerName')}
                        </div>
                      </TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-600/50 select-none"
                        onClick={() => handleSort('averageRating')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Rating</span>
                          {getSortIcon('averageRating')}
                        </div>
                      </TableHead>
                      <TableHead>Your Rating</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedStores.map((store) => (
                      <TableRow key={store.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg">
                              <Building2 className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <div className="font-medium text-slate-900 dark:text-slate-100">
                                {store.name}
                              </div>
                              <div className="text-sm text-slate-500 dark:text-slate-400">
                                {store.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs">
                                {store.ownerName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                {store.ownerName}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate text-sm text-slate-600 dark:text-slate-400">
                            {store.address}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className={cn("font-medium", store.averageRating && store.averageRating >= 4 ? "text-green-600" : store.averageRating && store.averageRating >= 3 ? "text-yellow-600" : "text-red-600")}>
                              {store.averageRating !== null && store.averageRating !== undefined 
                                ? store.averageRating.toFixed(2) 
                                : 'N/A'
                              }
                            </span>
                            <span className="text-xs text-slate-500">
                              ({store.totalRatings})
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {userRatings[store.id]?.rating ? (
                            <Badge variant="secondary" className="text-sm">
                              {userRatings[store.id].rating}/5
                            </Badge>
                          ) : (
                            <span className="text-sm text-slate-400">Not rated</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {ratingStore === store.id ? (
                            <div className="flex items-center space-x-2">
                              <Select
                                value={newRating.toString()}
                                onValueChange={(value) => setNewRating(Number(value))}
                              >
                                <SelectTrigger className="w-20">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {[1, 2, 3, 4, 5].map(rating => (
                                    <SelectItem key={rating} value={rating.toString()}>
                                      {rating}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button
                                onClick={() => handleSubmitRating(store.id)}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Submit
                              </Button>
                              <Button
                                onClick={() => setRatingStore(null)}
                                variant="outline"
                                size="sm"
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button
                              onClick={() => setRatingStore(store.id)}
                              variant="outline"
                              size="sm"
                              className="border-blue-200 text-blue-600 hover:bg-blue-50"
                            >
                              {userRatings[store.id]?.rating ? 'Update Rating' : 'Rate Store'}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {filteredAndSortedStores.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-slate-500 text-lg">No stores found matching your criteria.</p>
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

// Profile dialog mount
export default function UserDashboardWithProfile() {
  return (
    <>
      <UserDashboard />
      <ProfileDialog open={false} onOpenChange={() => {}} />
    </>
  )
}
