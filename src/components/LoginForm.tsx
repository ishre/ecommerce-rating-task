'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoginFormProps {
  onSwitchToRegister: () => void
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  
  const { login } = useAuth()

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {}

    if (!email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!password) {
      newErrors.password = 'Password is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})

    const result = await login(email, password)
    
    if (result.success) {
      // Redirect to dashboard after successful login
      window.location.href = '/dashboard'
    } else {
      setErrors({ password: result.message })
    }
    
    setIsLoading(false)
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: undefined }))
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: undefined }))
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={handleEmailChange}
              className={cn(
                "pl-10",
                errors.email && "border-red-500 focus:border-red-500"
              )}
              disabled={isLoading}
            />
          </div>
          {errors.email && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-1 text-sm text-red-500"
            >
              <AlertCircle className="h-3 w-3" />
              <span>{errors.email}</span>
            </motion.div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={handlePasswordChange}
              className={cn(
                "pl-10 pr-10",
                errors.password && "border-red-500 focus:border-red-500"
              )}
              disabled={isLoading}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-slate-400" />
              ) : (
                <Eye className="h-4 w-4 text-slate-400" />
              )}
            </Button>
          </div>
          {errors.password && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-1 text-sm text-red-500"
            >
              <AlertCircle className="h-3 w-3" />
              <span>{errors.password}</span>
            </motion.div>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Signing In...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <LogIn className="h-4 w-4" />
              <span>Sign In</span>
            </div>
          )}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Don&apos;t have an account?{' '}
          <Button
            variant="link"
            className="p-0 h-auto font-semibold text-blue-600 hover:text-blue-700"
            onClick={onSwitchToRegister}
          >
            Sign up here
          </Button>
        </p>
      </div>

      {/* Quick Login Demo */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 border-blue-200 dark:border-blue-800">
        <CardContent >
          <div className="flex items-center space-x-2 mb-2 text-center  justify-center">
            
            <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
              Quick login for testing
            </span>
          </div>
          <div className="space-y-2 text-xs">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => {
                setEmail('admin@ecomrating.com')
                setPassword('AdminPass123!')
              }}
            >
              Admin Account
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => {
                setEmail('user@ecomrating.com')
                setPassword('UserPass123!')
              }}
            >
              User Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
