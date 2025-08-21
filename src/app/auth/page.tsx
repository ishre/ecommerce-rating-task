'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Building2, 
  Users, 
  Star, 
  Shield, 
  TrendingUp,
  Sparkles
} from 'lucide-react'
import { LoginForm } from '@/components/LoginForm'
import { RegisterForm } from '@/components/RegisterForm'

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState('login')

  const features = [
    {
      icon: Building2,
      title: 'Store Management',
      description: 'Comprehensive store rating and review system'
    },
    {
      icon: Users,
      title: 'Role-Based Access',
      description: 'Secure access control for different user types'
    },
    {
      icon: Star,
      title: 'Rating System',
      description: '1-5 star rating with detailed feedback'
    },
    {
      icon: Shield,
      title: 'Secure Platform',
      description: 'Enterprise-grade security and authentication'
    }
  ]

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Features */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <Badge variant="secondary" className="text-sm">
                Professional Platform
              </Badge>
            </div>
            <h1 className="text-4xl pb-1 lg:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
              EcomRating
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-md">
              The ultimate platform for store ratings and reviews with advanced analytics and role-based management.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-start space-x-3 p-4 rounded-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-white/20"
              >
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                  <feature.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex items-center pb-1 space-x-4 text-sm text-slate-600 dark:text-slate-400">
            <TrendingUp className="h-4 w-4" />
            <span>Trusted by thousands of businesses worldwide</span>
          </div>
        </motion.div>

        {/* Right Side - Auth Forms */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center"
        >
          <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-bold text-center">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-center">
                Sign in to your account or create a new one
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="register">Sign Up</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login" className="space-y-4">
                  <LoginForm onSwitchToRegister={() => setActiveTab('register')} />
                </TabsContent>
                
                <TabsContent value="register" className="space-y-4">
                  <RegisterForm onSwitchToLogin={() => setActiveTab('login')} />
                </TabsContent>
              </Tabs>

            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
