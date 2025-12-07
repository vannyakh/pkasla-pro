'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, MapPin, Globe, Upload, X, Loader2 } from 'lucide-react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { useCreateEvent, useUpdateEvent, useEventCategories } from '@/hooks/api/useEvent'
import { api } from '@/lib/axios-client'
import { Event } from '@/types/event'

// Mapping event types to Khmer labels
const eventTypeLabels: Record<string, string> = {
  wedding: 'ពិធីរៀបមង្គលការ',
  engagement: 'ពិធីភ្ជាប់ពាក្យ',
  'hand-cutting': 'ពិធីកាត់ចំណងដៃ',
  birthday: 'ពិធីខួបកំណើត',
  anniversary: 'ពិធីខួប',
  other: 'ផ្សេងៗ',
}

interface EventFormProps {
  event?: Event
  onSuccess?: () => void
  onCancel?: () => void
}

export function EventForm({ event, onSuccess, onCancel }: EventFormProps) {
  const router = useRouter()
  const isEditMode = !!event
  const createEvent = useCreateEvent()
  const updateEvent = useUpdateEvent()
  const { data: eventCategories = [], isLoading: isLoadingCategories } = useEventCategories()
  
  // Map categories to the format needed for the Select component
  const eventTypes = eventCategories.map((category) => ({
    value: category,
    label: eventTypeLabels[category] || category,
  }))

  // Convert date to datetime-local format
  const formatDateForInput = (date: string | Date | undefined): string => {
    if (!date) return ''
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date
      if (isNaN(dateObj.getTime())) return ''
      // Convert to local time and format as datetime-local
      const year = dateObj.getFullYear()
      const month = String(dateObj.getMonth() + 1).padStart(2, '0')
      const day = String(dateObj.getDate()).padStart(2, '0')
      const hours = String(dateObj.getHours()).padStart(2, '0')
      const minutes = String(dateObj.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day}T${hours}:${minutes}`
    } catch {
      return ''
    }
  }

  const [formData, setFormData] = useState({
    title: event?.title || '',
    eventType: (event?.eventType || '') as 'wedding' | 'engagement' | 'hand-cutting' | 'birthday' | 'anniversary' | 'other' | '',
    startDate: formatDateForInput(event?.date),
    address: event?.venue || '',
    googleMapLink: event?.googleMapLink || '',
    description: event?.description || '',
    restrictDuplicateNames: event?.restrictDuplicateNames || false,
    coverImage: null as File | null,
    khqrUsd: null as File | null,
    khqrKhr: null as File | null,
  })
  const [uploadedUrls, setUploadedUrls] = useState<{
    coverImage?: string
    khqrUsd?: string
    khqrKhr?: string
  }>({
    coverImage: event?.coverImage,
    khqrUsd: event?.khqrUsd,
    khqrKhr: event?.khqrKhr,
  })
  const [uploadStates, setUploadStates] = useState<{
    coverImage?: { isUploading: boolean; progress: number; error?: string }
    khqrUsd?: { isUploading: boolean; progress: number; error?: string }
    khqrKhr?: { isUploading: boolean; progress: number; error?: string }
  }>({})
  const [previews, setPreviews] = useState<{
    coverImage?: string
    khqrUsd?: string
    khqrKhr?: string
  }>({
    coverImage: event?.coverImage,
    khqrUsd: event?.khqrUsd,
    khqrKhr: event?.khqrKhr,
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = async (field: 'coverImage' | 'khqrUsd' | 'khqrKhr', file: File | null) => {
    if (!file) {
      setFormData((prev) => ({ ...prev, [field]: null }))
      setUploadedUrls((prev) => {
        const newUrls = { ...prev }
        delete newUrls[field]
        return newUrls
      })
      setPreviews((prev) => {
        const newPreviews = { ...prev }
        delete newPreviews[field]
        return newPreviews
      })
      setUploadStates((prev) => {
        const newStates = { ...prev }
        delete newStates[field]
        return newStates
      })
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadStates((prev) => ({
        ...prev,
        [field]: { isUploading: false, progress: 0, error: 'Please select an image file' },
      }))
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadStates((prev) => ({
        ...prev,
        [field]: { isUploading: false, progress: 0, error: 'Image size must be less than 5MB' },
      }))
      return
    }

    // Create preview immediately
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviews((prev) => ({ ...prev, [field]: reader.result as string }))
    }
    reader.readAsDataURL(file)

    // Set file in form data
    setFormData((prev) => ({ ...prev, [field]: file }))

    // Clear previous errors
    setUploadStates((prev) => ({
      ...prev,
      [field]: { isUploading: true, progress: 0 },
    }))

    // Upload file to server
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('folder', 'events')

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
          setUploadStates((prev) => ({
            ...prev,
            [field]: { isUploading: true, progress },
          }))
        }
      )

      if (response.success && response.data) {
        setUploadedUrls((prev) => ({ ...prev, [field]: response.data!.url }))
        setUploadStates((prev) => ({
          ...prev,
          [field]: { isUploading: false, progress: 100 },
        }))
      } else {
        throw new Error(response.error || 'Failed to upload image')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image'
      setUploadStates((prev) => ({
        ...prev,
        [field]: { isUploading: false, progress: 0, error: errorMessage },
      }))
      setFormData((prev) => ({ ...prev, [field]: null }))
      setPreviews((prev) => {
        const newPreviews = { ...prev }
        delete newPreviews[field]
        return newPreviews
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.eventType || !formData.startDate || !formData.address) {
      return
    }

    // Check if any files are still uploading
    const isAnyUploading = Object.values(uploadStates).some((state) => state?.isUploading)
    if (isAnyUploading) {
      return
    }

    try {
      const eventData = {
        title: formData.title || eventTypes.find((t) => t.value === formData.eventType)?.label || '',
        eventType: formData.eventType as 'wedding' | 'engagement' | 'hand-cutting' | 'birthday' | 'anniversary' | 'other',
        date: formData.startDate,
        venue: formData.address,
        googleMapLink: formData.googleMapLink || undefined,
        description: formData.description || undefined,
        restrictDuplicateNames: formData.restrictDuplicateNames,
        coverImage: uploadedUrls.coverImage || undefined,
        khqrUsd: uploadedUrls.khqrUsd || undefined,
        khqrKhr: uploadedUrls.khqrKhr || undefined,
      }

      if (isEditMode && event) {
        // Update existing event
        await updateEvent.mutateAsync({ id: event.id, data: eventData, files: undefined })
        onSuccess?.()
      } else {
        // Create new event
        const createdEvent = await createEvent.mutateAsync({ data: eventData, files: undefined })
        // Redirect to event detail page
        router.push(`/dashboard/events/${createdEvent.id}`)
        onSuccess?.()
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} event:`, error)
    }
  }

  const isSubmitting = isEditMode ? updateEvent.isPending : createEvent.isPending

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Event Title */}
      <div>
        <Label htmlFor="title" className="text-sm font-semibold text-black mb-2 block">
          ចំណងជើង
        </Label>
        <Input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="ចំណងជើងកម្មវិធី"
          className="w-full h-10 text-sm"
        />
      </div>

      {/* Event Type */}
      <div>
        <Label htmlFor="eventType" className="text-sm font-semibold text-black mb-2 block">
          ប្រភេទកម្មវិធី
        </Label>
        <Select 
          value={formData.eventType} 
          onValueChange={(value) => handleInputChange('eventType', value)}
          disabled={isLoadingCategories || eventTypes.length === 0}
        >
          <SelectTrigger className="w-full h-10 text-sm">
            <SelectValue placeholder={isLoadingCategories ? 'កំពុងផ្ទុក...' : eventTypes.length === 0 ? 'មិនមានប្រភេទ' : 'ជ្រើសរើសប្រភេទកម្មវិធី'} />
          </SelectTrigger>
          {eventTypes.length > 0 && (
            <SelectContent>
              {eventTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          )}
        </Select>
      </div>

      {/* Start Date */}
      <div>
        <Label htmlFor="startDate" className="text-sm font-semibold text-black mb-2 flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          ថ្ងៃចាប់ផ្តើម
        </Label>
        <Input
          id="startDate"
          type="datetime-local"
          value={formData.startDate}
          onChange={(e) => handleInputChange('startDate', e.target.value)}
          className="w-full h-10 text-sm"
          required
        />
      </div>

      {/* Address */}
      <div>
        <Label htmlFor="address" className="text-sm font-semibold text-black mb-2 flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          អាសយដ្ឋាន
          <span className="text-xs font-normal text-gray-600">*(ពត៌មានដែលបង្ហាញនៅលើធៀប)</span>
        </Label>
        <Input
          id="address"
          type="text"
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          placeholder="ទីតាំងកម្មវិធីដែលត្រូវប្រព្រឹត្តឡើង"
          className="w-full h-10 text-sm"
          required
        />
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description" className="text-sm font-semibold text-black mb-2 block">
          ពិព័រណ៍
        </Label>
        <Input
          id="description"
          type="text"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="ពិព័រណ៍អំពីកម្មវិធី"
          className="w-full h-10 text-sm"
        />
      </div>

      {/* Google Map Link */}
      <div>
        <Label htmlFor="googleMapLink" className="text-sm font-semibold text-black mb-2 flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Google Map
          <span className="text-xs font-normal text-gray-600">*(ពត៌មានដែលបង្ហាញនៅលើធៀប)</span>
        </Label>
        <Input
          id="googleMapLink"
          type="url"
          value={formData.googleMapLink}
          onChange={(e) => handleInputChange('googleMapLink', e.target.value)}
          placeholder="តំណភ្ជាប់ Google Map"
          className="w-full h-10 text-sm"
        />
      </div>

      {/* Guest Restriction */}
      <div className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg bg-gray-50">
        <Checkbox
          id="restrictDuplicateNames"
          checked={formData.restrictDuplicateNames}
          onCheckedChange={(checked) => handleInputChange('restrictDuplicateNames', checked as boolean)}
          className="border-red-500 data-[state=checked]:bg-red-500"
        />
        <Label
          htmlFor="restrictDuplicateNames"
          className="text-sm font-medium text-black cursor-pointer"
        >
          មិនអនុញ្ញាតឱ្យមានភ្ញៀវឈ្មោះដូចគ្នា
        </Label>
      </div>

      {/* File Uploads */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Cover Image */}
        <div>
          <Label className="text-sm font-semibold text-black mb-2 block">
            រូបភាពផ្ទៃទំព័រ <span className="text-xs font-normal text-gray-600">*(មិនចាំបាច់)</span>
          </Label>
          <FileUpload
            file={formData.coverImage}
            preview={previews.coverImage}
            onFileChange={(file) => handleFileUpload('coverImage', file)}
            accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
            uploadState={uploadStates.coverImage}
            fieldName="coverImage"
          />
        </div>

        {/* KHQR USD */}
        <div>
          <Label className="text-sm font-semibold text-black mb-2 block">
            KHQR ប្រាក់ដុល្លារ <span className="text-xs font-normal text-gray-600">*(មិនចាំបាច់)</span>
          </Label>
          <FileUpload
            file={formData.khqrUsd}
            preview={previews.khqrUsd}
            onFileChange={(file) => handleFileUpload('khqrUsd', file)}
            accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
            uploadState={uploadStates.khqrUsd}
            fieldName="khqrUsd"
          />
        </div>

        {/* KHQR KHR */}
        <div>
          <Label className="text-sm font-semibold text-black mb-2 block">
            KHQR ប្រាក់រៀល <span className="text-xs font-normal text-gray-600">*(មិនចាំបាច់)</span>
          </Label>
          <FileUpload
            file={formData.khqrKhr}
            preview={previews.khqrKhr}
            onFileChange={(file) => handleFileUpload('khqrKhr', file)}
            accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
            uploadState={uploadStates.khqrKhr}
            fieldName="khqrKhr"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 flex gap-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
          className={`${onCancel ? 'flex-1' : 'w-full'} bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg`}
        >
          {isSubmitting ? 'កំពុងរក្សាទុក...' : isEditMode ? 'អាប់ដេត' : 'រក្សាទុក'}
        </Button>
      </div>
    </form>
  )
}

// FileUpload component (same as in CreateEventForm)
function FileUpload({
  file,
  preview,
  onFileChange,
  accept,
  uploadState,
  fieldName,
}: {
  file: File | null
  preview?: string
  onFileChange: (file: File | null) => void
  accept: string
  uploadState?: { isUploading: boolean; progress: number; error?: string }
  fieldName: string
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
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        isDragging ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
      } ${uploadState?.error ? 'border-red-500' : ''}`}
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
        disabled={uploadState?.isUploading}
      />
      {displayImage ? (
        <div className="space-y-3">
          <div className="relative">
            <img
              src={displayImage}
              alt="Preview"
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
            {!uploadState?.isUploading && (
              <button
                type="button"
                onClick={() => onFileChange(null)}
                className="text-red-500 hover:text-red-600 ml-2"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {!uploadState?.isUploading && (
            <label
              htmlFor={`file-${fieldName}`}
              className="text-xs text-red-500 cursor-pointer hover:underline block"
            >
              Click to change
            </label>
          )}
        </div>
      ) : (
        <label htmlFor={`file-${fieldName}`} className="cursor-pointer">
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

