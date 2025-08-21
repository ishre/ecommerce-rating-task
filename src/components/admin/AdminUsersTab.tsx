'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { UserPlus, Filter, Download, RefreshCw, ChevronLeft, ChevronRight, Star, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { toast } from 'sonner'
import { TableSkeleton } from '@/components/ui/loading-skeleton'
import { cn } from '@/lib/utils'

interface User {
  id: string
  name: string
  email: string
  address: string
  role: string
  createdAt: string
  averageRating: number | null
}

type SortField = 'name' | 'email' | 'role' | 'createdAt' | 'averageRating'
type SortDirection = 'asc' | 'desc'

export const AdminUsersTab: React.FC = () => {
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false)
  const [showEditUserDialog, setShowEditUserDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  
  // Filters
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    address: '',
    role: 'all'
  })
  
  // Sorting
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [usersPerPage] = useState(10)
  
  // Form state
  const [createUserForm, setCreateUserForm] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 'NORMAL_USER'
  })

  // Debounced filter effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1) // Reset to first page when filters change
    }, 300)

    return () => clearTimeout(timer)
  }, [filters])

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        setAllUsers(data)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
      toast.error('Failed to fetch users')
    } finally {
      setIsLoading(false)
    }
  }

  // Client-side filtering and sorting
  const filteredAndSortedUsers = useMemo(() => {
    const filtered = allUsers.filter(user => {
      const nameMatch = user.name.toLowerCase().includes(filters.name.toLowerCase())
      const emailMatch = user.email.toLowerCase().includes(filters.email.toLowerCase())
      const addressMatch = user.address.toLowerCase().includes(filters.address.toLowerCase())
      const roleMatch = filters.role === 'all' || user.role === filters.role
      
      return nameMatch && emailMatch && addressMatch && roleMatch
    })

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortField] as string | number | Date | null
      let bValue = b[sortField] as string | number | Date | null

      // Handle null values for rating
      if (sortField === 'averageRating') {
        aValue = aValue ?? 0
        bValue = bValue ?? 0
      }

      // Handle date sorting
      if (sortField === 'createdAt') {
        aValue = aValue ? new Date(aValue) : new Date(0)
        bValue = bValue ? new Date(bValue) : new Date(0)
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
  }, [allUsers, filters, sortField, sortDirection])

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

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createUserForm),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('User created successfully!')
        setCreateUserForm({
          name: '',
          email: '',
          password: '',
          address: '',
          role: 'NORMAL_USER'
        })
        setShowCreateUserDialog(false)
        fetchUsers()
      } else {
        toast.error(data.error || 'Failed to create user')
      }
    } catch (error) {
      toast.error('Failed to create user')
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'SYSTEM_ADMIN':
        return 'destructive'
      case 'STORE_OWNER':
        return 'default'
      case 'NORMAL_USER':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getRatingColor = (rating: number | null) => {
    if (!rating) return 'text-slate-400'
    if (rating >= 4) return 'text-green-600'
    if (rating >= 3) return 'text-yellow-600'
    return 'text-red-600'
  }

  const openEditUser = (user: User) => {
    setEditingUser(user)
    setShowEditUserDialog(true)
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return
    try {
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingUser.name,
          email: editingUser.email,
          address: editingUser.address,
          role: editingUser.role,
        })
      })
      const data = await response.json()
      if (response.ok) {
        toast.success('User updated successfully')
        setShowEditUserDialog(false)
        setEditingUser(null)
        fetchUsers()
      } else {
        toast.error(data.error || 'Failed to update user')
      }
    } catch (error) {
      toast.error('Failed to update user')
    }
  }

  // Pagination calculations
  const startIndex = (currentPage - 1) * usersPerPage
  const endIndex = startIndex + usersPerPage
  const currentUsers = filteredAndSortedUsers.slice(startIndex, endIndex)
  const totalPages = Math.ceil(filteredAndSortedUsers.length / usersPerPage)

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
            User Management
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Manage all users on your platform
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => setShowCreateUserDialog(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
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
              onClick={() => setFilters({ name: '', email: '', address: '', role: 'all' })}
              className="text-slate-500 hover:text-slate-700"
            >
              Clear Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="user-name-filter">Name</Label>
              <Input
                id="user-name-filter"
                placeholder="Filter by name"
                value={filters.name}
                onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
                className="bg-white/50 dark:bg-slate-700/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-email-filter">Email</Label>
              <Input
                id="user-email-filter"
                placeholder="Filter by email"
                value={filters.email}
                onChange={(e) => setFilters(prev => ({ ...prev, email: e.target.value }))}
                className="bg-white/50 dark:bg-slate-700/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-address-filter">Address</Label>
              <Input
                id="user-address-filter"
                placeholder="Filter by address"
                value={filters.address}
                onChange={(e) => setFilters(prev => ({ ...prev, address: e.target.value }))}
                className="bg-white/50 dark:bg-slate-700/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-role-filter">Role</Label>
              <Select
                value={filters.role}
                onValueChange={(value) => setFilters(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger className="bg-white/50 dark:bg-slate-700/50">
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  <SelectItem value="SYSTEM_ADMIN">System Admin</SelectItem>
                  <SelectItem value="NORMAL_USER">Normal User</SelectItem>
                  <SelectItem value="STORE_OWNER">Store Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Users</CardTitle>
              <CardDescription>
                Showing {filteredAndSortedUsers.length > 0 ? startIndex + 1 : 0}-{Math.min(endIndex, filteredAndSortedUsers.length)} of {filteredAndSortedUsers.length} users
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchUsers}
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
                      <span>User</span>
                      {getSortIcon('name')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-600/50 select-none"
                    onClick={() => handleSort('role')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Role</span>
                      {getSortIcon('role')}
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
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Created</span>
                      {getSortIcon('createdAt')}
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs">
                            {user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-slate-900 dark:text-slate-100">
                            {user.name}
                          </div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate text-sm text-slate-600 dark:text-slate-400">
                        {user.address}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className={cn("font-medium", getRatingColor(user.averageRating))}>
                          {user.averageRating !== null && user.averageRating !== undefined 
                            ? user.averageRating.toFixed(2) 
                            : 'N/A'
                          }
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="outline" size="sm" onClick={() => openEditUser(user)}>
                        Edit
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

      {/* Create User Dialog */}
      <Dialog open={showCreateUserDialog} onOpenChange={setShowCreateUserDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user to your platform with the specified role and permissions.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="user-name">Name</Label>
                <Input
                  id="user-name"
                  placeholder="Enter full name (20-60 characters)"
                  value={createUserForm.name}
                  onChange={(e) => setCreateUserForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-email">Email</Label>
                <Input
                  id="user-email"
                  type="email"
                  placeholder="Enter email address"
                  value={createUserForm.email}
                  onChange={(e) => setCreateUserForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="user-password">Password</Label>
                <Input
                  id="user-password"
                  type="password"
                  placeholder="8-16 chars, uppercase + special char"
                  value={createUserForm.password}
                  onChange={(e) => setCreateUserForm(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-role">Role</Label>
                <Select
                  value={createUserForm.role}
                  onValueChange={(value) => setCreateUserForm(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NORMAL_USER">Normal User</SelectItem>
                    <SelectItem value="STORE_OWNER">Store Owner</SelectItem>
                    <SelectItem value="SYSTEM_ADMIN">System Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-address">Address</Label>
              <Input
                id="user-address"
                placeholder="Enter address (max 400 characters)"
                value={createUserForm.address}
                onChange={(e) => setCreateUserForm(prev => ({ ...prev, address: e.target.value }))}
                required
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateUserDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600">
                Create User
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditUserDialog} onOpenChange={setShowEditUserDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user details and role</DialogDescription>
          </DialogHeader>
          {editingUser && (
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-user-name">Name</Label>
                  <Input
                    id="edit-user-name"
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-user-email">Email</Label>
                  <Input
                    id="edit-user-email"
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-user-role">Role</Label>
                  <Select
                    value={editingUser.role}
                    onValueChange={(value) => setEditingUser({ ...editingUser, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NORMAL_USER">Normal User</SelectItem>
                      <SelectItem value="STORE_OWNER">Store Owner</SelectItem>
                      <SelectItem value="SYSTEM_ADMIN">System Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-user-address">Address</Label>
                  <Input
                    id="edit-user-address"
                    value={editingUser.address}
                    onChange={(e) => setEditingUser({ ...editingUser, address: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowEditUserDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600">
                  Save Changes
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
