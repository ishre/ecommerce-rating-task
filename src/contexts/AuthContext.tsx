'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { UserRole } from '@prisma/client'
import { toast } from 'sonner'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  address: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  register: (name: string, email: string, password: string, address: string) => Promise<{ success: boolean; message: string }>
  logout: () => Promise<void>
  isLoading: boolean
  updateProfile: (args: { name?: string; address?: string; currentPassword?: string; newPassword?: string }) => Promise<{ success: boolean; message: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        toast.success('Welcome back!', {
          description: `Logged in as ${data.user.name}`,
        })
        return { success: true, message: 'Login successful' }
      } else {
        toast.error('Login failed', {
          description: data.error || 'Invalid credentials',
        })
        return { success: false, message: data.error || 'Login failed' }
      }
    } catch (error) {
      toast.error('Login failed', {
        description: 'Network error. Please try again.',
      })
      return { success: false, message: 'Network error' }
    }
  }

  const register = async (name: string, email: string, password: string, address: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, address }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Registration successful!', {
          description: 'You can now log in with your credentials.',
        })
        return { success: true, message: 'Registration successful' }
      } else {
        toast.error('Registration failed', {
          description: data.error || 'Registration failed',
        })
        return { success: false, message: data.error || 'Registration failed' }
      }
    } catch (error) {
      toast.error('Registration failed', {
        description: 'Network error. Please try again.',
      })
      return { success: false, message: 'Network error' }
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      toast.success('Logged out successfully')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Logout failed', {
        description: 'Please try again.',
      })
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading, updateProfile: async ({ name, address, currentPassword, newPassword }) => {
      try {
        const response = await fetch('/api/auth/me', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, address, currentPassword, newPassword })
        })
        const data = await response.json()
        if (response.ok) {
          if (data.user) setUser(data.user)
          toast.success('Profile updated')
          return { success: true, message: 'Updated' }
        }
        toast.error(data.error || 'Update failed')
        return { success: false, message: data.error || 'Update failed' }
      } catch (error) {
        toast.error('Network error')
        return { success: false, message: 'Network error' }
      }
    } }}>
      {children}
    </AuthContext.Provider>
  )
}
