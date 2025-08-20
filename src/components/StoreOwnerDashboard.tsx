'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

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
}

export const StoreOwnerDashboard: React.FC = () => {
  const { user, logout } = useAuth()
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
    }
  }

  const handleLogout = async () => {
    await logout()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (stores.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <h1 className="text-3xl font-bold text-gray-900">Store Owner Dashboard</h1>
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">Welcome, {user?.name}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              No Stores Found
            </h2>
            <p className="text-gray-600">
              You don't have any stores assigned to your account. Please contact an administrator.
            </p>
          </div>
        </main>
      </div>
    )
  }

  const currentStore = stores.find(store => store.id === selectedStore)

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Store Owner Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Store Selection */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Select Store:</label>
            <select
              value={selectedStore || ''}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Store Overview */}
      {currentStore && (
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-blue-900 mb-2">Store Name</h3>
                <p className="text-blue-700">{currentStore.name}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-green-900 mb-2">Average Rating</h3>
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-green-700">
                    {currentStore.averageRating !== null && currentStore.averageRating !== undefined ? currentStore.averageRating.toFixed(2) : 'N/A'}
                  </span>
                  <span className="text-sm text-green-600 ml-2">
                    / 5.0
                  </span>
                </div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-yellow-900 mb-2">Total Ratings</h3>
                <p className="text-2xl font-bold text-yellow-700">
                  {currentStore.totalRatings}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ratings List */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Store Ratings
              </h3>
              
              {storeRatings.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No ratings yet for this store.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {storeRatings.map((rating) => (
                        <tr key={rating.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {rating.user.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {rating.user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {rating.user.address}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="text-lg font-semibold text-yellow-600">
                                {rating.rating}
                              </span>
                              <span className="text-sm text-gray-500 ml-1">/ 5</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(rating.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
