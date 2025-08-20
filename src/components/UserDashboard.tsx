'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

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

export const UserDashboard: React.FC = () => {
  const { user, logout } = useAuth()
  const [stores, setStores] = useState<Store[]>([])
  const [userRatings, setUserRatings] = useState<Record<string, UserRating>>({})
  const [filters, setFilters] = useState({
    name: '',
    address: ''
  })
  const [isLoading, setIsLoading] = useState(true)
  const [ratingStore, setRatingStore] = useState<string | null>(null)
  const [newRating, setNewRating] = useState(5)

  useEffect(() => {
    fetchStores()
  }, [filters])

  const fetchStores = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.name) params.append('name', filters.name)
      if (filters.address) params.append('address', filters.address)
      
      const response = await fetch(`/api/stores?${params}`)
      if (response.ok) {
        const storesData = await response.json()
        setStores(storesData)
        
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
    } finally {
      setIsLoading(false)
    }
  }

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
        // Update local state
        setUserRatings(prev => ({
          ...prev,
          [storeId]: { rating: newRating }
        }))
        
        // Refresh stores to update average ratings
        fetchStores()
        setRatingStore(null)
        setNewRating(5)
      }
    } catch (error) {
      console.error('Failed to submit rating:', error)
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Store Ratings</h1>
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

      {/* Search Filters */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <input
              type="text"
              placeholder="Search stores by name"
              className="border border-gray-300 rounded-md px-3 py-2"
              value={filters.name}
              onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
            />
            <input
              type="text"
              placeholder="Search stores by address"
              className="border border-gray-300 rounded-md px-3 py-2"
              value={filters.address}
              onChange={(e) => setFilters(prev => ({ ...prev, address: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* Stores List */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-6">
            {stores.map((store) => (
              <div key={store.id} className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{store.name}</h3>
                    <p className="text-gray-600 mb-2">{store.address}</p>
                    <p className="text-sm text-gray-500 mb-2">Owner: {store.ownerName}</p>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 mr-2">Average Rating:</span>
                        <div className="flex items-center">
                          <span className="text-lg font-semibold text-yellow-600">
                            {store.averageRating !== null && store.averageRating !== undefined ? store.averageRating.toFixed(2) : 'N/A'}
                          </span>
                          <span className="text-sm text-gray-500 ml-1">
                            ({store.totalRatings} ratings)
                          </span>
                        </div>
                      </div>
                      {userRatings[store.id]?.rating && (
                        <div className="flex items-center">
                          <span className="text-sm text-gray-500 mr-2">Your Rating:</span>
                          <span className="text-lg font-semibold text-blue-600">
                            {userRatings[store.id].rating}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    {ratingStore === store.id ? (
                      <div className="flex items-center space-x-2">
                        <select
                          value={newRating}
                          onChange={(e) => setNewRating(Number(e.target.value))}
                          className="border border-gray-300 rounded px-2 py-1"
                        >
                          {[1, 2, 3, 4, 5].map(rating => (
                            <option key={rating} value={rating}>{rating}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleSubmitRating(store.id)}
                          className="bg-green-500 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                        >
                          Submit
                        </button>
                        <button
                          onClick={() => setRatingStore(null)}
                          className="bg-gray-500 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setRatingStore(store.id)}
                        className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
                      >
                        {userRatings[store.id]?.rating ? 'Update Rating' : 'Rate Store'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {stores.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No stores found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
