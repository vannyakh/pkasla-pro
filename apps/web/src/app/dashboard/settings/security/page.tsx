'use client'

import { useState } from 'react'
import { Lock, Key, Shield, Save, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import toast from 'react-hot-toast'

export default function SecurityPage() {
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)

    try {
      // TODO: Replace with actual API call
      // const response = await api.put('/auth/change-password', {
      //   currentPassword: passwordData.currentPassword,
      //   newPassword: passwordData.newPassword,
      // })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast.success('Password updated successfully')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error) {
      toast.error('Failed to update password. Please check your current password.')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleTwoFactor = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await api.post(`/auth/two-factor/${twoFactorEnabled ? 'disable' : 'enable'}`)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      setTwoFactorEnabled(!twoFactorEnabled)
      toast.success(`Two-factor authentication ${!twoFactorEnabled ? 'enabled' : 'disabled'}`)
    } catch (error) {
      toast.error('Failed to update two-factor authentication')
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Change Password */}
      <Card className="border border-gray-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Lock className="h-5 w-5 text-black" />
            <div>
              <CardTitle className="text-lg font-semibold text-black">Change Password</CardTitle>
              <CardDescription className="text-sm text-gray-600">
                Update your password to keep your account secure
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-sm font-medium text-gray-700">
                Current Password
              </Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="pl-10 pr-10 h-11 text-sm border-gray-300"
                  placeholder="Enter current password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords((prev) => ({ ...prev, current: !prev.current }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                  {showPasswords.current ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                New Password
              </Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="pl-10 pr-10 h-11 text-sm border-gray-300"
                  placeholder="Enter new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords((prev) => ({ ...prev, new: !prev.new }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                  {showPasswords.new ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500">Must be at least 6 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Confirm New Password
              </Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="pl-10 pr-10 h-11 text-sm border-gray-300"
                  placeholder="Confirm new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 text-sm font-medium disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Password
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card className="border border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-black" />
              <div>
                <CardTitle className="text-lg font-semibold text-black">
                  Two-Factor Authentication
                </CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  Add an extra layer of security to your account
                </CardDescription>
              </div>
            </div>
            <Button
              type="button"
              variant={twoFactorEnabled ? 'outline' : 'default'}
              onClick={toggleTwoFactor}
              className="h-9"
            >
              {twoFactorEnabled ? 'Disable' : 'Enable'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            {twoFactorEnabled
              ? 'Two-factor authentication is currently enabled. Your account is protected with an additional security layer.'
              : 'Enable two-factor authentication to require a verification code in addition to your password when signing in.'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
