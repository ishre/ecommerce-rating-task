'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Store, Filter, Download, RefreshCw, ChevronLeft, ChevronRight, Star, Building2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { toast } from 'sonner'
import { TableSkeleton } from '@/components/ui/loading-skeleton'
import { cn } from '@/lib/utils'

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

interface User {
  id: string
  name: string
  email: string
  role: string
}

type SortField = 'name' | 'email' | 'ownerName' | 'averageRating' | 'totalRatings'
type SortDirection = 'asc' | 'desc'

export const AdminStoresTab: React.FC = () => {
  const [allStores, setAllStores] = useState<Store[]>([])
  const [storeOwners, setStoreOwners] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateStoreDialog, setShowCreateStoreDialog] = useState(false)
  
  // Filters
  const [filters, setFilters] = useState({
    name: '',
    address: ''
  })
  
  // Sorting
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [storesPerPage] = useState(10)
  
  // Form state
  const [createStoreForm, setCreateStoreForm] = useState({
    name: '',
    email: '',
    address: '',
    ownerId: ''
  })

  // Debounced filter effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1) // Reset to first page when filters change
    }, 300)

    return () => clearTimeout(timer)
  }, [filters])

  useEffect(() => {
    fetchStores()
    fetchStoreOwners()
  }, [])

  const fetchStores = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/stores')
      if (response.ok) {
        const data = await response.json()
        setAllStores(data)
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

  const fetchStoreOwners = async () => {
    try {
      const response = await fetch('/api/users?role=STORE_OWNER')
      if (response.ok) {
        const data = await response.json()
        setStoreOwners(data)
      }
    } catch (error) {
      console.error('Failed to fetch store owners:', error)
    }
  }

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/stores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createStoreForm),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Store created successfully!')
        setCreateStoreForm({
          name: '',
          email: '',
          address: '',
          ownerId: ''
        })
        setShowCreateStoreDialog(false)
        fetchStores()
      } else {
        toast.error(data.error || 'Failed to create store')
      }
    } catch (error) {
      toast.error('Failed to create store')
    }
  }

  const getRatingColor = (rating: number | null) => {
    if (!rating) return 'text-slate-400'
    if (rating >= 4) return 'text-green-600'
    if (rating >= 3) return 'text-yellow-600'
    return 'text-red-600'
  }

  // Pagination calculations
  const startIndex = (currentPage - 1) * storesPerPage
  const endIndex = startIndex + storesPerPage
  const currentStores = filteredAndSortedStores.slice(startIndex, endIndex)
  const totalPages = Math.ceil(filteredAndSortedStores.length / storesPerPage)

  if (isLoading) {
    return <TableSkeleton />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Store Management
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Manage all stores on your platform
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => setShowCreateStoreDialog(true)}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
          >
            <Store className="h-4 w-4 mr-2" />
            Add Store
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Filters</span>
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
              <Label htmlFor="store-name-filter">Store Name</Label>
              <Input
                id="store-name-filter"
                placeholder="Filter by store name"
                value={filters.name}
                onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
                className="bg-white/50 dark:bg-slate-700/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-address-filter">Address</Label>
              <Input
                id="store-address-filter"
                placeholder="Filter by address"
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
              <CardTitle>Stores</CardTitle>
              <CardDescription>
                Showing {filteredAndSortedStores.length > 0 ? startIndex + 1 : 0}-{Math.min(endIndex, filteredAndSortedStores.length)} of {filteredAndSortedStores.length} stores
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchStores}
              className="border-green-200 text-green-600 hover:bg-green-50"
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
                  <TableHead 
                    className="cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-600/50 select-none"
                    onClick={() => handleSort('totalRatings')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Total Ratings</span>
                      {getSortIcon('totalRatings')}
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentStores.map((store) => (
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
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {store.ownerEmail}
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
                        <span className={cn("font-medium", getRatingColor(store.averageRating))}>
                          {store.averageRating !== null && store.averageRating !== undefined 
                            ? store.averageRating.toFixed(2) 
                            : 'N/A'
                          }
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {store.totalRatings} ratings
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Store Dialog */}
      <Dialog open={showCreateStoreDialog} onOpenChange={setShowCreateStoreDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Store</DialogTitle>
            <DialogDescription>
              Add a new store to your platform and assign it to a store owner.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateStore} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="store-name">Store Name</Label>
                <Input
                  id="store-name"
                  placeholder="Enter store name"
                  value={createStoreForm.name}
                  onChange={(e) => setCreateStoreForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="store-email">Store Email</Label>
                <Input
                  id="store-email"
                  type="email"
                  placeholder="Enter store email"
                  value={createStoreForm.email}
                  onChange={(e) => setCreateStoreForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-address">Store Address</Label>
              <Input
                id="store-address"
                placeholder="Enter store address"
                value={createStoreForm.address}
                onChange={(e) => setCreateStoreForm(prev => ({ ...prev, address: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-owner">Store Owner</Label>
              <Select
                value={createStoreForm.ownerId}
                onValueChange={(value) => setCreateStoreForm(prev => ({ ...prev, ownerId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a store owner" />
                </SelectTrigger>
                <SelectContent>
                  {storeOwners.map((owner) => (
                    <SelectItem key={owner.id} value={owner.id}>
                      {owner.name} ({owner.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateStoreDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-green-600 to-blue-600">
                Create Store
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
