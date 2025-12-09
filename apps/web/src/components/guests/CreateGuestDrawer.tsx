'use client'

import React, { useState, useEffect } from 'react'
import { X, MapPin, Loader2, Upload } from 'lucide-react'
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
import { api } from '@/lib/axios-client'
import type { Guest, GuestStatus, CreateGuestDto, UpdateGuestDto } from '@/types/guest'
import toast from 'react-hot-toast'

interface GuestDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trigger?: React.ReactNode
  guest?: Guest | null // If provided, it's edit mode
  onSuccess?: () => void
  eventId?: string // Pre-selected event ID (useful when creating guest from event detail page)
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
  eventId,
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
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | undefined>(undefined)
  const [photoUploadState, setPhotoUploadState] = useState<{
    isUploading: boolean
    progress: number
    error?: string
  } | undefined>(undefined)

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
      setPhotoPreview(guest.photo || undefined)
      setPhotoFile(null)
      setPhotoUploadState(undefined)
      setShowAddress(!!(guest.address || guest.province))
    } else {
      // Reset form for create mode, pre-select eventId if provided
      setFormData({
        name: '',
        email: '',
        phone: '',
        eventId: eventId || '',
        occupation: '',
        notes: '',
        tag: '',
        address: '',
        province: '',
        photo: '',
        status: 'pending',
      })
      setPhotoPreview(undefined)
      setPhotoFile(null)
      setPhotoUploadState(undefined)
      setShowAddress(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, guest?.id, eventId])

  const handleInputChange = (field: keyof GuestFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handlePhotoUpload = async (file: File | null) => {
    if (!file) {
      setPhotoFile(null)
      setPhotoPreview(undefined)
      setPhotoUploadState(undefined)
      setFormData((prev) => ({ ...prev, photo: '' }))
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setPhotoUploadState({
        isUploading: false,
        progress: 0,
        error: 'Please select an image file',
      })
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setPhotoUploadState({
        isUploading: false,
        progress: 0,
        error: 'Image size must be less than 5MB',
      })
      return
    }

    // Create preview immediately
    const reader = new FileReader()
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Set file
    setPhotoFile(file)

    // Clear previous errors
    setPhotoUploadState({
      isUploading: true,
      progress: 0,
    })

    // Upload file to server
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('folder', 'guests')

      const response = await api.upload<{
        id: string
        url: string
        key: string
        provider: string
        filename: string
        mimetype: string
        size: number
        folder: string
        createdAt: string
      }>(
        '/upload/single',
        uploadFormData,
        (progress) => {
          setPhotoUploadState({
            isUploading: true,
            progress,
          })
        }
      )

      if (response.success && response.data) {
        setFormData((prev) => ({ ...prev, photo: response.data!.url }))
        setPhotoUploadState({
          isUploading: false,
          progress: 100,
        })
      } else {
        throw new Error(response.error || 'Failed to upload image')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image'
      setPhotoUploadState({
        isUploading: false,
        progress: 0,
        error: errorMessage,
      })
      setPhotoFile(null)
      setPhotoPreview(undefined)
      setFormData((prev) => ({ ...prev, photo: '' }))
    }
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

    // Check if photo is still uploading
    if (photoUploadState?.isUploading) {
      toast.error('Please wait for photo upload to complete')
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
                disabled={isLoading || isEditMode || !!eventId}
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

            {/* Photo Upload */}
            <div>
              <Label className="text-sm font-semibold text-black mb-2 block">
                រូបភាព <span className="text-xs font-normal text-gray-600">*(មិនចាំបាច់)</span>
              </Label>
              <GuestPhotoUpload
                file={photoFile}
                preview={photoPreview}
                onFileChange={handlePhotoUpload}
                accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                uploadState={photoUploadState}
                fieldName="photo"
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
            className="h-10"
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

// Guest Photo Upload Component
function GuestPhotoUpload({
  file,
  preview,
  onFileChange,
  accept,
  uploadState,
  fieldName,
  disabled,
}: {
  file: File | null
  preview?: string
  onFileChange: (file: File | null) => void
  accept: string
  uploadState?: { isUploading: boolean; progress: number; error?: string }
  fieldName: string
  disabled?: boolean
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [objectUrl, setObjectUrl] = useState<string | null>(null)

  // Clean up object URL on unmount or when file changes
  React.useEffect(() => {
    if (file && !preview) {
      const url = URL.createObjectURL(file)
      setObjectUrl(url)
      return () => {
        URL.revokeObjectURL(url)
      }
    } else {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
        setObjectUrl(null)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, preview])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      onFileChange(droppedFile)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      onFileChange(selectedFile)
    }
    e.target.value = ''
  }

  const displayImage = preview || objectUrl

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
        isDragging ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
      } ${uploadState?.error ? 'border-red-500' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        id={`file-${fieldName}`}
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploadState?.isUploading || disabled}
      />
      {displayImage ? (
        <div className="space-y-3">
          <div className="relative">
            <img
              src={displayImage}
              alt="Photo preview"
              className="w-full h-32 object-cover rounded-lg"
            />
            {uploadState?.isUploading && (
              <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="h-6 w-6 animate-spin text-white mx-auto mb-2" />
                  <p className="text-xs text-white">{uploadState.progress}%</p>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700 truncate">{file?.name || 'Uploaded'}</p>
              {uploadState?.error && (
                <p className="text-xs text-red-600 mt-1">{uploadState.error}</p>
              )}
              {uploadState?.isUploading && (
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                  <div
                    className="bg-red-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${uploadState.progress}%` }}
                  />
                </div>
              )}
            </div>
            {!uploadState?.isUploading && !disabled && (
              <button
                type="button"
                onClick={() => onFileChange(null)}
                className="text-red-500 hover:text-red-600 ml-2"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {!uploadState?.isUploading && !disabled && (
            <label
              htmlFor={`file-${fieldName}`}
              className="text-xs text-red-500 cursor-pointer hover:underline block"
            >
              Click to change
            </label>
          )}
        </div>
      ) : (
        <label htmlFor={`file-${fieldName}`} className={`cursor-pointer ${disabled ? 'pointer-events-none' : ''}`}>
          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-red-500 font-medium mb-1">Click to upload or drag and drop</p>
          <p className="text-xs text-gray-500">PNG, JPG, GIF, WEBP up to 5MB</p>
          {uploadState?.error && (
            <p className="text-xs text-red-600 mt-1">{uploadState.error}</p>
          )}
        </label>
      )}
    </div>
  )
}

