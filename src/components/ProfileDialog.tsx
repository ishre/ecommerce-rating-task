'use client'

import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'

interface ProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const ProfileDialog: React.FC<ProfileDialogProps> = ({ open, onOpenChange }) => {
  const { user, updateProfile } = useAuth()
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (user && open) {
      setName(user.name || '')
      setAddress(user.address || '')
      setCurrentPassword('')
      setNewPassword('')
    }
  }, [user, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const result = await updateProfile({ name, address, currentPassword: currentPassword || undefined, newPassword: newPassword || undefined })
    setIsSubmitting(false)
    if (result.success) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>Update your profile information or change your password.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Name</Label>
              <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name (2-60 characters)" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-email">Email</Label>
              <Input id="profile-email" value={user?.email || ''} disabled />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-address">Address</Label>
            <Input id="profile-address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Your address (<= 400 chars)" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="profile-current-password">Current Password</Label>
              <Input id="profile-current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Required to set a new password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-new-password">New Password</Label>
              <Input id="profile-new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="8-16 chars, uppercase + special" />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-blue-600 to-purple-600">
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}


