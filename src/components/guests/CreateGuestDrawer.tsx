'use client'

import React, { useState } from 'react'
import { X, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'

interface CreateGuestDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trigger?: React.ReactNode
  onSave?: (data: GuestFormData) => void
}

interface GuestFormData {
  name: string
  phone: string
  occupation: string
  notes: string
  tag: string
  addressSearch: string
  province: string
  verify: string
}

export default function CreateGuestDrawer({
  open,
  onOpenChange,
  trigger,
  onSave,
}: CreateGuestDrawerProps) {
  const [formData, setFormData] = useState<GuestFormData>({
    name: '',
    phone: '',
    occupation: '',
    notes: '',
    tag: '',
    addressSearch: '',
    province: '',
    verify: '',
  })
  const [showAddress, setShowAddress] = useState(false)

  const handleInputChange = (field: keyof GuestFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    if (!formData.name) return // Name is required
    onSave?.(formData)
    // Reset form
    setFormData({
      name: '',
      phone: '',
      occupation: '',
      notes: '',
      tag: '',
      addressSearch: '',
      province: '',
      verify: '',
    })
    onOpenChange(false)
  }

  const handleCancel = () => {
    setFormData({
      name: '',
      phone: '',
      occupation: '',
      notes: '',
      tag: '',
      addressSearch: '',
      province: '',
      verify: '',
    })
    onOpenChange(false)
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
      <DrawerContent className="max-h-screen h-full w-full sm:max-w-lg">
        <DrawerHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle className="text-lg font-semibold text-black">បង្កើតភ្ញៀវថ្មី</DrawerTitle>
              <DrawerDescription className="text-sm text-gray-600 mt-1">
                ពត៍មានទូទៅ
              </DrawerDescription>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>
        <div className="px-4 py-6 overflow-y-auto flex-1 space-y-6">
          {/* General Information Section */}
          <div className="space-y-4">
            {/* Name */}
            <div>
              <Label htmlFor="name" className="text-sm font-semibold text-black mb-2 block">
                ឈ្មោះ <span className="text-gray-600">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Pkasla"
                className="h-10"
                required
              />
            </div>

            {/* Phone Number */}
            <div>
              <Label htmlFor="phone" className="text-sm font-semibold text-black mb-2 block">
                លេខទូរសព្ទ
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="លេខទូរសព្ទ"
                className="h-10"
              />
            </div>

            {/* Occupation */}
            <div>
              <Label htmlFor="occupation" className="text-sm font-semibold text-black mb-2 block">
                មុខរបរ
              </Label>
              <Input
                id="occupation"
                type="text"
                value={formData.occupation}
                onChange={(e) => handleInputChange('occupation', e.target.value)}
                placeholder="មុខរបរ"
                className="h-10"
              />
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes" className="text-sm font-semibold text-black mb-2 block">
                កត់ចំណាំ
              </Label>
              <Input
                id="notes"
                type="text"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="កត់ចំណាំ"
                className="h-10"
              />
            </div>
          </div>

          {/* Tags Section */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-black">ស្លាក (tags)</Label>
            <Select value={formData.tag} onValueChange={(value) => handleInputChange('tag', value)}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="ជ្រើសរើសក្រុម" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bride">ភ្ញៀវកូនក្រមុំ</SelectItem>
                <SelectItem value="groom">ភ្ញៀវកូនកំលោះ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Address Section */}
          {showAddress && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-black">អាសយដ្ឋាន</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => setShowAddress(false)}
                >
                  លាក់
                </Button>
              </div>

              {/* Search */}
              <div>
                <Label htmlFor="addressSearch" className="text-sm font-semibold text-black mb-2 block">
                  ស្វែងរក
                </Label>
                <div className="relative">
                  <Input
                    id="addressSearch"
                    type="text"
                    value={formData.addressSearch}
                    onChange={(e) => handleInputChange('addressSearch', e.target.value)}
                    placeholder="ស្វែងរក"
                    className="h-10 pr-10"
                  />
                  <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Province */}
              <div>
                <Label htmlFor="province" className="text-sm font-semibold text-black mb-2 block">
                  ខេត្ត/រាជធានី
                </Label>
                <Select value={formData.province} onValueChange={(value) => handleInputChange('province', value)}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="ខេត្ត/រាជធានី" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phnom-penh">ភ្នំពេញ</SelectItem>
                    <SelectItem value="siem-reap">សៀមរាប</SelectItem>
                    <SelectItem value="battambang">បាត់ដំបង</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Verify */}
              <div>
                <Label htmlFor="verify" className="text-sm font-semibold text-black mb-2 block">
                  ផ្ទៀងផ្ទាត់
                </Label>
                <Input
                  id="verify"
                  type="text"
                  value={formData.verify}
                  onChange={(e) => handleInputChange('verify', e.target.value)}
                  placeholder="ផ្ទៀងផ្ទាត់"
                  className="h-10"
                />
              </div>
            </div>
          )}

          {!showAddress && (
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold text-black">អាសយដ្ឋាន</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs h-7"
                onClick={() => setShowAddress(true)}
              >
                បង្ហាញ
              </Button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="px-4 py-4 border-t flex items-center justify-end gap-3">
          <Button variant="outline" onClick={handleCancel} className="h-10">
            បោះបង់
          </Button>
          <Button onClick={handleSave} className="h-10 bg-black hover:bg-gray-800 text-white" disabled={!formData.name}>
            រក្សាទុក
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

