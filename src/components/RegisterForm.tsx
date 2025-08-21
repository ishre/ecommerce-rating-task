'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Mail, 
  Lock, 
  MapPin, 
  Eye, 
  EyeOff, 
  UserPlus,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { validatePassword, validateName, validateAddress, validateEmail } from '@/lib/auth'

interface RegisterFormProps {
  onSwitchToLogin: () => void
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string | undefined }>({})
  
  const { register } = useAuth()

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!validateName(formData.name)) {
      newErrors.name = 'Name must be between 20 and 60 characters'
    }

    if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be 8-16 characters with at least one uppercase letter and one special character'
    }

    if (!validateAddress(formData.address)) {
      newErrors.address = 'Address must be 400 characters or less'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})

    const result = await register(formData.name, formData.email, formData.password, formData.address)
    
    if (result.success) {
      // Redirect to login page on successful registration
      onSwitchToLogin()
    } else {
      setErrors({ general: result.message })
    }
    
    setIsLoading(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const getPasswordStrength = () => {
    const { password } = formData
    if (!password) return { strength: 0, color: 'bg-slate-200', text: '' }
    
    let strength = 0
    if (password.length >= 8) strength++
    if (password.length <= 16) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++
    
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500']
    const texts = ['Very Weak', 'Weak', 'Medium', 'Strong']
    
    return {
      strength: Math.min(strength, 4),
      color: colors[strength - 1] || 'bg-slate-200',
      text: texts[strength - 1] || ''
    }
  }

  const passwordStrength = getPasswordStrength()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">
            Full Name
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your full name (2-60 characters)"
              value={formData.name}
              onChange={handleChange}
              className={cn(
                "pl-10",
                errors.name && "border-red-500 focus:border-red-500"
              )}
              disabled={isLoading}
            />
          </div>
          {errors.name && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-1 text-sm text-red-500"
            >
              <AlertCircle className="h-3 w-3" />
              <span>{errors.name}</span>
            </motion.div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleChange}
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
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="8-16 chars, uppercase + special char"
              value={formData.password}
              onChange={handleChange}
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
          
          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">Password strength:</span>
                <span className={cn(
                  "font-medium",
                  passwordStrength.strength >= 3 ? "text-green-600" : "text-orange-600"
                )}>
                  {passwordStrength.text}
                </span>
              </div>
              <div className="flex space-x-1">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-colors",
                      level <= passwordStrength.strength ? passwordStrength.color : "bg-slate-200"
                    )}
                  />
                ))}
              </div>
            </div>
          )}
          
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

        <div className="space-y-2">
          <Label htmlFor="address" className="text-sm font-medium">
            Address
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Textarea
              id="address"
              name="address"
              placeholder="Enter your address (max 400 characters)"
              value={formData.address}
              onChange={handleChange}
              className={cn(
                "pl-10 min-h-[80px] resize-none",
                errors.address && "border-red-500 focus:border-red-500"
              )}
              disabled={isLoading}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{formData.address.length}/400 characters</span>
            {formData.address.length > 0 && (
              <div className="flex items-center space-x-1">
                {formData.address.length <= 400 ? (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                ) : (
                  <AlertCircle className="h-3 w-3 text-red-500" />
                )}
                <span className={formData.address.length <= 400 ? "text-green-600" : "text-red-600"}>
                  {formData.address.length <= 400 ? "Valid" : "Too long"}
                </span>
              </div>
            )}
          </div>
          {errors.address && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-1 text-sm text-red-500"
            >
              <AlertCircle className="h-3 w-3" />
              <span>{errors.address}</span>
            </motion.div>
          )}
        </div>

        {errors.general && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-1 text-sm text-red-500"
          >
            <AlertCircle className="h-3 w-3" />
            <span>{errors.general}</span>
          </motion.div>
        )}

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Creating Account...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <UserPlus className="h-4 w-4" />
              <span>Create Account</span>
            </div>
          )}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Already have an account?{' '}
          <Button
            variant="link"
            className="p-0 h-auto font-semibold text-blue-600 hover:text-blue-700"
            onClick={onSwitchToLogin}
          >
            Sign in here
          </Button>
        </p>
      </div>

      {/* Requirements Card */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Badge variant="secondary" className="text-xs">
            Requirements
          </Badge>
        </div>
        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span>Name: 2-60 characters</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span>Password: 8-16 characters with uppercase + special char</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span>Address: Maximum 400 characters</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
