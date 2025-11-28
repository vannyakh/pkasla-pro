'use client'

import React, { useState, useEffect } from 'react'
import { X, MapPin, Loader2 } from 'lucide-react'
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
import { useCreateGuest, useUpdateGuest } from '@/hooks/api/useGuest'
import { useMyEvents } from '@/hooks/api/useEvent'
import type { Guest, GuestStatus, CreateGuestDto, UpdateGuestDto } from '@/types/guest'
import toast from 'react-hot-toast'

interface GuestDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trigger?: React.ReactNode
  guest?: Guest | null // If provided, it's edit mode
  onSuccess?: () => void
}

interface GuestFormData {
  name: string
  email: string
  phone: string
  eventId: string
  occupation: string
  notes: string
  tag: string
  address: string
  province: string
  photo: string
  status: GuestStatus
}

export default function GuestDrawer({
  open,
  onOpenChange,
  trigger,
  guest,
  onSuccess,
}: GuestDrawerProps) {
  const isEditMode = !!guest
  const createMutation = useCreateGuest()
  const updateMutation = useUpdateGuest()
  const { data: events = [] } = useMyEvents()

  const [formData, setFormData] = useState<GuestFormData>({
    name: '',
    email: '',
    phone: '',
    eventId: '',
    occupation: '',
    notes: '',
    tag: '',
    address: '',
    province: '',
    photo: '',
    status: 'pending',
  })
  const [showAddress, setShowAddress] = useState(false)

  // Load guest data when in edit mode
  useEffect(() => {
    if (!open) return

    if (guest) {
      const eventId = typeof guest.eventId === 'string' ? guest.eventId : guest.eventId.id
      setFormData({
        name: guest.name || '',
        email: guest.email || '',
        phone: guest.phone || '',
        eventId: eventId || '',
        occupation: guest.occupation || '',
        notes: guest.notes || '',
        tag: guest.tag || '',
        address: guest.address || '',
        province: guest.province || '',
        photo: guest.photo || '',
        status: guest.status || 'pending',
      })
      setShowAddress(!!(guest.address || guest.province))
    } else {
      // Reset form for create mode
      setFormData({
        name: '',
        email: '',
        phone: '',
        eventId: '',
        occupation: '',
        notes: '',
        tag: '',
        address: '',
        province: '',
        photo: '',
        status: 'pending',
      })
      setShowAddress(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, guest?.id])

  const handleInputChange = (field: keyof GuestFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!formData.name) {
      toast.error('Name is required')
      return
    }
    if (!formData.eventId) {
      toast.error('Event is required')
      return
    }

    try {
      if (isEditMode && guest) {
        const updateData: UpdateGuestDto = {
          name: formData.name,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          occupation: formData.occupation || undefined,
          notes: formData.notes || undefined,
          tag: formData.tag || undefined,
          address: formData.address || undefined,
          province: formData.province || undefined,
          photo: formData.photo || undefined,
          status: formData.status,
        }
        await updateMutation.mutateAsync({ id: guest.id, data: updateData })
        toast.success('Guest updated successfully')
      } else {
        const createData: CreateGuestDto = {
          name: formData.name,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          eventId: formData.eventId,
          occupation: formData.occupation || undefined,
          notes: formData.notes || undefined,
          tag: formData.tag || undefined,
          address: formData.address || undefined,
          province: formData.province || undefined,
          photo: formData.photo || undefined,
          status: formData.status,
        }
        await createMutation.mutateAsync(createData)
        toast.success('Guest created successfully')
      }
      onSuccess?.()
      onOpenChange(false)
    } catch {
      // Error is handled by the mutation hook
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
      <DrawerContent className="max-h-screen h-full w-full sm:max-w-lg">
        <DrawerHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle className="text-lg font-semibold text-black">
                {isEditMode ? 'កែប្រែភ្ញៀវ' : 'បង្កើតភ្ញៀវថ្មី'}
              </DrawerTitle>
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
                disabled={isLoading}
              />
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" className="text-sm font-semibold text-black mb-2 block">
                អ៊ីម៉ែល
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="email@example.com"
                className="h-10"
                disabled={isLoading}
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
                disabled={isLoading}
              />
            </div>

            {/* Event */}
            <div>
              <Label htmlFor="eventId" className="text-sm font-semibold text-black mb-2 block">
                ព្រឹត្តិការណ៍ <span className="text-gray-600">*</span>
              </Label>
              <Select
                value={formData.eventId}
                onValueChange={(value) => handleInputChange('eventId', value)}
                disabled={isLoading || isEditMode}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="ជ្រើសរើសព្រឹត្តិការណ៍" />
                </SelectTrigger>
                <SelectContent>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div>
              <Label htmlFor="status" className="text-sm font-semibold text-black mb-2 block">
                ស្ថានភាព
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange('status', value as GuestStatus)}
                disabled={isLoading}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="ជ្រើសរើសស្ថានភាព" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                </SelectContent>
              </Select>
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

            {/* Photo URL */}
            <div>
              <Label htmlFor="photo" className="text-sm font-semibold text-black mb-2 block">
                រូបភាព (URL)
              </Label>
              <Input
                id="photo"
                type="url"
                value={formData.photo}
                onChange={(e) => handleInputChange('photo', e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="h-10"
                disabled={isLoading}
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
                disabled={isLoading}
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

              {/* Address */}
              <div>
                <Label htmlFor="address" className="text-sm font-semibold text-black mb-2 block">
                  អាសយដ្ឋាន
                </Label>
                <div className="relative">
                  <Input
                    id="address"
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="អាសយដ្ឋាន"
                    className="h-10 pr-10"
                    disabled={isLoading}
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
          <Button variant="outline" onClick={handleCancel} className="h-10" disabled={isLoading}>
            បោះបង់
          </Button>
          <Button
            onClick={handleSave}
            className="h-10 bg-black hover:bg-gray-800 text-white"
            disabled={!formData.name || !formData.eventId || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isEditMode ? 'កំពុងរក្សាទុក...' : 'កំពុងបង្កើត...'}
              </>
            ) : (
              'រក្សាទុក'
            )}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

