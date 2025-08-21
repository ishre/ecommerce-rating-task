'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Building2, Star } from 'lucide-react'
import { toast } from 'sonner'
import { DashboardSkeleton } from '@/components/ui/loading-skeleton'
import Lottie from 'lottie-react'

interface DashboardStats {
  totalUsers: number
  totalStores: number
  totalRatings: number
}

interface TopRatedStoreGlance {
  id: string
  name: string
  averageRating: number
  totalRatings: number
}

type LottieJSON = Record<string, unknown>

export const AdminDashboardStats: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [topStores, setTopStores] = useState<TopRatedStoreGlance[]>([])
  const [usersAnim, setUsersAnim] = useState<LottieJSON | null>(null)
  const [storesAnim, setStoresAnim] = useState<LottieJSON | null>(null)
  const [ratingsAnim, setRatingsAnim] = useState<LottieJSON | null>(null)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  useEffect(() => {
    const animations = [
      'https://assets5.lottiefiles.com/private_files/lf30_p9tibhns.json',
      'https://assets4.lottiefiles.com/packages/lf20_7fwvvesa.json',
      'https://assets10.lottiefiles.com/packages/lf20_8xq7r6k3.json'
    ]
    Promise.all(
      animations.map((url) => fetch(url).then((r) => r.json() as Promise<LottieJSON>).catch(() => null))
    )
      .then(([usersJson, storesJson, ratingsJson]) => {
        setUsersAnim(usersJson)
        setStoresAnim(storesJson)
        setRatingsAnim(ratingsJson)
      })
      .catch(() => {})
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/dashboard')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
        if (data.topRatedStores) {
          setTopStores(data.topRatedStores)
        }
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
      toast.error('Failed to fetch dashboard statistics')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <DashboardSkeleton />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Stats Cards with compact sizing and Lottie animations */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="p-1.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-md">
                <Users className="h-4 w-4 text-white" />
              </div>
              <Badge variant="secondary" className="text-[10px]">Total</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {stats?.totalUsers || 0}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">Registered Users</p>
              </div>
              <div className="w-16 h-16 opacity-90">
                {usersAnim && (
                  <Lottie animationData={usersAnim} loop autoplay style={{ width: '100%', height: '100%' }} />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="p-1.5 bg-gradient-to-r from-green-500 to-green-600 rounded-md">
                <Building2 className="h-4 w-4 text-white" />
              </div>
              <Badge variant="secondary" className="text-[10px]">Total</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {stats?.totalStores || 0}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">Active Stores</p>
              </div>
              <div className="w-16 h-16 opacity-90">
                {storesAnim && (
                  <Lottie animationData={storesAnim} loop autoplay style={{ width: '100%', height: '100%' }} />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="p-1.5 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-md">
                <Star className="h-4 w-4 text-white" />
              </div>
              <Badge variant="secondary" className="text-[10px]">Total</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {stats?.totalRatings || 0}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">Ratings Submitted</p>
              </div>
              <div className="w-16 h-16 opacity-90">
                {ratingsAnim && (
                  <Lottie animationData={ratingsAnim} loop autoplay style={{ width: '100%', height: '100%' }} />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Rated Stores Glance */}
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Top Rated Stores</CardTitle>
          <CardDescription>Based on average rating and total reviews</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {topStores.length === 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">No rated stores yet.</p>
          ) : (
            <div className="divide-y divide-slate-200/60 dark:divide-slate-700/60">
              {topStores.map((s, idx) => (
                <div key={s.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white text-xs dark:bg-white dark:text-slate-900">
                      {idx + 1}
                    </span>
                    <div className="truncate">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{s.name}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{s.totalRatings} review{s.totalRatings === 1 ? '' : 's'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="text-sm font-semibold">{s.averageRating.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
