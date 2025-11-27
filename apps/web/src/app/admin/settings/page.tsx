'use client'

import React, { useState } from 'react'
import {
  Settings,
  Shield,
  Database,
  Bell,
  Info,
  Save,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import toast from 'react-hot-toast'

interface SettingsFormData {
  // General Settings
  siteName: string
  siteUrl: string
  siteDescription: string
  maintenanceMode: boolean
  allowRegistration: boolean
  
  // Security Settings
  sessionTimeout: number
  maxLoginAttempts: number
  requireEmailVerification: boolean
  enable2FA: boolean
  passwordMinLength: number
  
  // Storage Settings
  storageProvider: 'local' | 'r2'
  storageLocalPath: string
  r2AccountId: string
  r2BucketName: string
  r2PublicUrl: string
  
  // Notification Settings
  emailEnabled: boolean
  emailFrom: string
  emailHost: string
  emailPort: number
  emailUser: string
  notificationOnUserRegistration: boolean
  notificationOnUserStatusChange: boolean
  
  // System Info
  nodeEnv: string
  version: string
  uptime: string
}

const defaultSettings: SettingsFormData = {
  siteName: 'PKASLA',
  siteUrl: 'https://pkasla.com',
  siteDescription: 'Professional Job Portal',
  maintenanceMode: false,
  allowRegistration: true,
  sessionTimeout: 3600,
  maxLoginAttempts: 5,
  requireEmailVerification: false,
  enable2FA: false,
  passwordMinLength: 8,
  storageProvider: 'local',
  storageLocalPath: 'uploads',
  r2AccountId: '',
  r2BucketName: '',
  r2PublicUrl: '',
  emailEnabled: false,
  emailFrom: 'noreply@pkasla.com',
  emailHost: 'smtp.example.com',
  emailPort: 587,
  emailUser: '',
  notificationOnUserRegistration: true,
  notificationOnUserStatusChange: true,
  nodeEnv: 'production',
  version: '1.0.0',
  uptime: '0 days',
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsFormData>(defaultSettings)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('general')

  const handleInputChange = (
    field: keyof SettingsFormData,
    value: string | number | boolean
  ) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // TODO: Replace with actual API call
      // await api.put('/admin/settings', settings)
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      toast.success('Settings saved successfully')
    } catch (error) {
      toast.error('Failed to save settings')
      console.error('Failed to save settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div>
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-semibold text-black">
          System Settings
        </h1>
        <p className="text-xs text-gray-600 mt-1">
          Configure system-wide settings and preferences
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="text-xs">
            <Settings className="h-3 w-3 mr-1" />
            General
          </TabsTrigger>
          <TabsTrigger value="security" className="text-xs">
            <Shield className="h-3 w-3 mr-1" />
            Security
          </TabsTrigger>
          <TabsTrigger value="storage" className="text-xs">
            <Database className="h-3 w-3 mr-1" />
            Storage
          </TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs">
            <Bell className="h-3 w-3 mr-1" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="system" className="text-xs">
            <Info className="h-3 w-3 mr-1" />
            System
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-black">
                General Settings
              </CardTitle>
              <CardDescription className="text-xs">
                Configure basic site information and general preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName" className="text-xs font-medium">
                  Site Name
                </Label>
                <Input
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) => handleInputChange('siteName', e.target.value)}
                  className="text-xs"
                  placeholder="Enter site name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteUrl" className="text-xs font-medium">
                  Site URL
                </Label>
                <Input
                  id="siteUrl"
                  type="url"
                  value={settings.siteUrl}
                  onChange={(e) => handleInputChange('siteUrl', e.target.value)}
                  className="text-xs"
                  placeholder="https://example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteDescription" className="text-xs font-medium">
                  Site Description
                </Label>
                <Input
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) =>
                    handleInputChange('siteDescription', e.target.value)
                  }
                  className="text-xs"
                  placeholder="Enter site description"
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="maintenanceMode" className="text-xs font-medium">
                    Maintenance Mode
                  </Label>
                  <p className="text-xs text-gray-500">
                    Enable to put the site in maintenance mode
                  </p>
                </div>
                <Switch
                  id="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) =>
                    handleInputChange('maintenanceMode', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allowRegistration" className="text-xs font-medium">
                    Allow Registration
                  </Label>
                  <p className="text-xs text-gray-500">
                    Allow new users to register
                  </p>
                </div>
                <Switch
                  id="allowRegistration"
                  checked={settings.allowRegistration}
                  onCheckedChange={(checked) =>
                    handleInputChange('allowRegistration', checked)
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4">
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-black">
                Security Settings
              </CardTitle>
              <CardDescription className="text-xs">
                Configure security and authentication settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout" className="text-xs font-medium">
                  Session Timeout (seconds)
                </Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) =>
                    handleInputChange('sessionTimeout', parseInt(e.target.value) || 0)
                  }
                  className="text-xs"
                  min={300}
                  max={86400}
                />
                <p className="text-xs text-gray-500">
                  Session will expire after this many seconds of inactivity
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxLoginAttempts" className="text-xs font-medium">
                  Max Login Attempts
                </Label>
                <Input
                  id="maxLoginAttempts"
                  type="number"
                  value={settings.maxLoginAttempts}
                  onChange={(e) =>
                    handleInputChange('maxLoginAttempts', parseInt(e.target.value) || 0)
                  }
                  className="text-xs"
                  min={3}
                  max={10}
                />
                <p className="text-xs text-gray-500">
                  Maximum failed login attempts before account lockout
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="passwordMinLength" className="text-xs font-medium">
                  Minimum Password Length
                </Label>
                <Input
                  id="passwordMinLength"
                  type="number"
                  value={settings.passwordMinLength}
                  onChange={(e) =>
                    handleInputChange('passwordMinLength', parseInt(e.target.value) || 0)
                  }
                  className="text-xs"
                  min={6}
                  max={32}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="requireEmailVerification" className="text-xs font-medium">
                    Require Email Verification
                  </Label>
                  <p className="text-xs text-gray-500">
                    Require users to verify their email before accessing the system
                  </p>
                </div>
                <Switch
                  id="requireEmailVerification"
                  checked={settings.requireEmailVerification}
                  onCheckedChange={(checked) =>
                    handleInputChange('requireEmailVerification', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enable2FA" className="text-xs font-medium">
                    Enable Two-Factor Authentication
                  </Label>
                  <p className="text-xs text-gray-500">
                    Allow users to enable 2FA for additional security
                  </p>
                </div>
                <Switch
                  id="enable2FA"
                  checked={settings.enable2FA}
                  onCheckedChange={(checked) =>
                    handleInputChange('enable2FA', checked)
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Storage Settings */}
        <TabsContent value="storage" className="space-y-4">
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-black">
                Storage Settings
              </CardTitle>
              <CardDescription className="text-xs">
                Configure file storage provider and settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="storageProvider" className="text-xs font-medium">
                  Storage Provider
                </Label>
                <Select
                  value={settings.storageProvider}
                  onValueChange={(value) =>
                    handleInputChange('storageProvider', value as 'local' | 'r2')
                  }
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="local">Local Storage</SelectItem>
                    <SelectItem value="r2">Cloudflare R2</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {settings.storageProvider === 'local' && (
                <div className="space-y-2">
                  <Label htmlFor="storageLocalPath" className="text-xs font-medium">
                    Local Storage Path
                  </Label>
                  <Input
                    id="storageLocalPath"
                    value={settings.storageLocalPath}
                    onChange={(e) =>
                      handleInputChange('storageLocalPath', e.target.value)
                    }
                    className="text-xs"
                    placeholder="uploads"
                  />
                </div>
              )}

              {settings.storageProvider === 'r2' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="r2AccountId" className="text-xs font-medium">
                      R2 Account ID
                    </Label>
                    <Input
                      id="r2AccountId"
                      value={settings.r2AccountId}
                      onChange={(e) =>
                        handleInputChange('r2AccountId', e.target.value)
                      }
                      className="text-xs"
                      placeholder="Enter R2 account ID"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="r2BucketName" className="text-xs font-medium">
                      R2 Bucket Name
                    </Label>
                    <Input
                      id="r2BucketName"
                      value={settings.r2BucketName}
                      onChange={(e) =>
                        handleInputChange('r2BucketName', e.target.value)
                      }
                      className="text-xs"
                      placeholder="Enter bucket name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="r2PublicUrl" className="text-xs font-medium">
                      R2 Public URL (Optional)
                    </Label>
                    <Input
                      id="r2PublicUrl"
                      type="url"
                      value={settings.r2PublicUrl}
                      onChange={(e) =>
                        handleInputChange('r2PublicUrl', e.target.value)
                      }
                      className="text-xs"
                      placeholder="https://your-bucket.your-domain.com"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-black">
                Email & Notification Settings
              </CardTitle>
              <CardDescription className="text-xs">
                Configure email server and notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="emailEnabled" className="text-xs font-medium">
                    Enable Email
                  </Label>
                  <p className="text-xs text-gray-500">
                    Enable email notifications
                  </p>
                </div>
                <Switch
                  id="emailEnabled"
                  checked={settings.emailEnabled}
                  onCheckedChange={(checked) =>
                    handleInputChange('emailEnabled', checked)
                  }
                />
              </div>

              {settings.emailEnabled && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label htmlFor="emailFrom" className="text-xs font-medium">
                      From Email Address
                    </Label>
                    <Input
                      id="emailFrom"
                      type="email"
                      value={settings.emailFrom}
                      onChange={(e) =>
                        handleInputChange('emailFrom', e.target.value)
                      }
                      className="text-xs"
                      placeholder="noreply@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emailHost" className="text-xs font-medium">
                      SMTP Host
                    </Label>
                    <Input
                      id="emailHost"
                      value={settings.emailHost}
                      onChange={(e) =>
                        handleInputChange('emailHost', e.target.value)
                      }
                      className="text-xs"
                      placeholder="smtp.example.com"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emailPort" className="text-xs font-medium">
                        SMTP Port
                      </Label>
                      <Input
                        id="emailPort"
                        type="number"
                        value={settings.emailPort}
                        onChange={(e) =>
                          handleInputChange('emailPort', parseInt(e.target.value) || 587)
                        }
                        className="text-xs"
                        placeholder="587"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emailUser" className="text-xs font-medium">
                        SMTP Username
                      </Label>
                      <Input
                        id="emailUser"
                        value={settings.emailUser}
                        onChange={(e) =>
                          handleInputChange('emailUser', e.target.value)
                        }
                        className="text-xs"
                        placeholder="smtp username"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label
                        htmlFor="notificationOnUserRegistration"
                        className="text-xs font-medium"
                      >
                        Notify on User Registration
                      </Label>
                      <p className="text-xs text-gray-500">
                        Send email when a new user registers
                      </p>
                    </div>
                    <Switch
                      id="notificationOnUserRegistration"
                      checked={settings.notificationOnUserRegistration}
                      onCheckedChange={(checked) =>
                        handleInputChange('notificationOnUserRegistration', checked)
                      }
                    />
        </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label
                        htmlFor="notificationOnUserStatusChange"
                        className="text-xs font-medium"
                      >
                        Notify on User Status Change
                      </Label>
                      <p className="text-xs text-gray-500">
                        Send email when user status changes
                      </p>
                    </div>
                    <Switch
                      id="notificationOnUserStatusChange"
                      checked={settings.notificationOnUserStatusChange}
                      onCheckedChange={(checked) =>
                        handleInputChange('notificationOnUserStatusChange', checked)
                      }
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Info */}
        <TabsContent value="system" className="space-y-4">
        <Card className="border border-gray-200">
          <CardHeader>
              <CardTitle className="text-sm font-semibold text-black">
                System Information
              </CardTitle>
              <CardDescription className="text-xs">
                View system information and status
              </CardDescription>
          </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-gray-500">
                    Environment
                  </Label>
                  <p className="text-xs text-black font-medium">
                    {settings.nodeEnv}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium text-gray-500">
                    Version
                  </Label>
                  <p className="text-xs text-black font-medium">
                    {settings.version}
                  </p>
                </div>

                <div className="space-y-2 col-span-2">
                  <Label className="text-xs font-medium text-gray-500">
                    Uptime
                  </Label>
                  <p className="text-xs text-black font-medium">
                    {settings.uptime}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-500">
                  System Status
                </Label>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <p className="text-xs text-black font-medium">All systems operational</p>
                </div>
              </div>
          </CardContent>
        </Card>
        </TabsContent>

        {/* Save Button */}
        <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={() => setSettings(defaultSettings)}
            className="text-xs h-8"
            disabled={isSaving}
          >
            Reset
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="text-xs h-8"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-3 w-3 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </Tabs>
    </div>
  )
}
