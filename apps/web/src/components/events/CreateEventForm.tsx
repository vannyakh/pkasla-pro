'use client'

import React, { useState } from 'react'
import { Calendar, MapPin, Globe, Upload, X } from 'lucide-react'
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
import { useEvent } from '@/hooks/useEvent'

const eventTypes = [
  { value: 'wedding', label: 'ពិធីរៀបមង្គលការ' },
  { value: 'engagement', label: 'ពិធីភ្ជាប់ពាក្យ' },
  { value: 'hand-cutting', label: 'ពិធីកាត់ចំណងដៃ' },
]

interface CreateEventFormProps {
  onSuccess?: () => void
}

export default function CreateEventForm({ onSuccess }: CreateEventFormProps) {
  const { createEvent } = useEvent()
  const [formData, setFormData] = useState({
    eventType: '',
    startDate: '',
    address: '',
    googleMapLink: '',
    restrictDuplicateNames: false,
    coverImage: null as File | null,
    khqrUsd: null as File | null,
    khqrKhr: null as File | null,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (field: string, file: File | null) => {
    setFormData((prev) => ({ ...prev, [field]: file }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const eventData = {
        title: eventTypes.find((t) => t.value === formData.eventType)?.label || '',
        date: formData.startDate,
        venue: formData.address,
        description: formData.googleMapLink,
      }

      const result = await createEvent(eventData)
      if (result.success) {
        // Reset form
        setFormData({
          eventType: '',
          startDate: '',
          address: '',
          googleMapLink: '',
          restrictDuplicateNames: false,
          coverImage: null,
          khqrUsd: null,
          khqrKhr: null,
        })
        onSuccess?.()
      }
    } catch (error) {
      console.error('Error creating event:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto">
      {/* Event Type */}
      <div>
        <Label htmlFor="eventType" className="text-sm font-semibold text-black mb-2 block">
          ប្រភេទកម្មវិធី
        </Label>
        <Select value={formData.eventType} onValueChange={(value) => handleInputChange('eventType', value)}>
          <SelectTrigger className="w-full h-10 text-sm">
            <SelectValue placeholder="ជ្រើសរើសប្រភេទកម្មវិធី" />
          </SelectTrigger>
          <SelectContent>
            {eventTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
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
      <div className="grid grid-cols-1 gap-4">
        {/* Cover Image */}
        <div>
          <Label className="text-sm font-semibold text-black mb-2 block">
            រូបភាពផ្ទៃទំព័រ <span className="text-xs font-normal text-gray-600">*(មិនចាំបាច់)</span>
          </Label>
          <FileUpload
            file={formData.coverImage}
            onFileChange={(file) => handleFileUpload('coverImage', file)}
            accept="image/png,image/jpeg,image/gif"
          />
        </div>

        {/* KHQR USD */}
        <div>
          <Label className="text-sm font-semibold text-black mb-2 block">
            KHQR ប្រាក់ដុល្លារ <span className="text-xs font-normal text-gray-600">*(មិនចាំបាច់)</span>
          </Label>
          <FileUpload
            file={formData.khqrUsd}
            onFileChange={(file) => handleFileUpload('khqrUsd', file)}
            accept="image/png,image/jpeg,image/gif"
          />
        </div>

        {/* KHQR KHR */}
        <div>
          <Label className="text-sm font-semibold text-black mb-2 block">
            KHQR ប្រាក់រៀល <span className="text-xs font-normal text-gray-600">*(មិនចាំបាច់)</span>
          </Label>
          <FileUpload
            file={formData.khqrKhr}
            onFileChange={(file) => handleFileUpload('khqrKhr', file)}
            accept="image/png,image/jpeg,image/gif"
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg"
        >
          {isSubmitting ? 'កំពុងរក្សាទុក...' : 'រក្សាទុក'}
        </Button>
      </div>
    </form>
  )
}

function FileUpload({
  file,
  onFileChange,
  accept,
}: {
  file: File | null
  onFileChange: (file: File | null) => void
  accept: string
}) {
  const [isDragging, setIsDragging] = useState(false)

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
  }

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        isDragging ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        id={`file-${accept}`}
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />
      {file ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700 truncate">{file.name}</span>
            <button
              type="button"
              onClick={() => onFileChange(null)}
              className="text-red-500 hover:text-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <label
            htmlFor={`file-${accept}`}
            className="text-xs text-red-500 cursor-pointer hover:underline"
          >
            Click to change
          </label>
        </div>
      ) : (
        <label htmlFor={`file-${accept}`} className="cursor-pointer">
          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-red-500 font-medium mb-1">Click to upload or drag and drop</p>
          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 50MB</p>
        </label>
      )}
    </div>
  )
}

