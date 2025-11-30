'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Upload, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/axios-client'

export interface ImageUploadResponse {
  id: string
  url: string
  key: string
  provider: string
  filename: string
  mimetype: string
  size: number
  folder: string
  createdAt: string
}

export interface ImageUploadProps {
  value?: string | null
  onChange?: (url: string | null) => void
  onError?: (error: string) => void
  folder?: string
  disabled?: boolean
  label?: string
  id?: string
  maxSize?: number // in MB, default 5MB
  accept?: string
  className?: string
  showLabel?: boolean
}

export function ImageUpload({
  value,
  onChange,
  onError,
  folder = 'uploads',
  disabled = false,
  label = 'Image',
  id = 'image-upload',
  maxSize = 5,
  accept = 'image/*',
  className = '',
  showLabel = true,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string>('')
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragCounterRef = useRef(0)

  // Update preview when value prop changes
  useEffect(() => {
    setPreview(value || null)
  }, [value])

  // Process and upload file (shared by both file input and drag & drop)
  const processFile = async (file: File) => {
    if (!file) {
      return
    }

    // Clear previous errors
    setError('')

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      const errorMsg = 'Please select a valid image file (JPEG, PNG, GIF, or WebP)'
      setError(errorMsg)
      onError?.(errorMsg)
      return
    }

    // Validate file size
    const maxSizeBytes = maxSize * 1024 * 1024
    if (file.size > maxSizeBytes) {
      const errorMsg = `Image size must be less than ${maxSize}MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`
      setError(errorMsg)
      onError?.(errorMsg)
      return
    }

    // Create preview immediately with error handling
    const reader = new FileReader()
    reader.onerror = () => {
      const errorMsg = 'Failed to read image file. Please try again.'
      setError(errorMsg)
      onError?.(errorMsg)
    }

    reader.onloadend = () => {
      if (reader.result) {
        setPreview(reader.result as string)
      }
    }

    reader.readAsDataURL(file)

    // Upload file to server
    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)

      const response = await api.upload<ImageUploadResponse>(
        '/upload/single',
        formData,
        (progress) => {
          setUploadProgress(Math.min(progress, 100))
        }
      )

      if (response.success && response.data?.url) {
        const uploadedUrl = response.data.url
        // Update preview to use the uploaded URL instead of data URL
        setPreview(uploadedUrl)
        // Notify parent component
        onChange?.(uploadedUrl)
      } else {
        throw new Error(response.error || 'Failed to upload image')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image'
      setError(errorMessage)
      onError?.(errorMessage)
      // Clear preview and uploaded URL on error
      setPreview(value || null) // Reset to original value
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      // Reset input if no file selected
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    await processFile(file)
  }

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current++
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current--
    if (dragCounterRef.current === 0) {
      setIsDragging(false)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    dragCounterRef.current = 0

    if (disabled || isUploading) {
      return
    }

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const file = files[0]
      await processFile(file)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    setError('')
    onChange?.(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={className}>
      {showLabel && (
        <Label htmlFor={id} className="text-sm font-semibold text-black mb-2 block">
          {label}
        </Label>
      )}
      {isUploading ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Loader2 className="h-8 w-8 text-gray-400 mx-auto mb-2 animate-spin" />
          <p className="text-sm text-gray-600">Uploading... {uploadProgress}%</p>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      ) : preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="h-48 w-full object-cover rounded-lg border border-gray-200"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleRemove}
            className="absolute top-2 right-2 h-8 w-8 p-0"
            disabled={disabled || isUploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-lg p-12 text-center flex flex-col items-center justify-center transition-all
            ${isDragging
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-gray-300 bg-white hover:border-indigo-400'
            }
            ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <Upload className={`h-8 w-8 mx-auto mb-2 ${isDragging ? 'text-indigo-500' : 'text-gray-400'}`} />
          <Label
            htmlFor={id}
            className={`text-sm mx-auto text-center ${isDragging ? 'text-indigo-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
          >
            {isDragging ? 'Drop the image here' : 'Click to upload or drag and drop'}
          </Label>
          <Input
            ref={fileInputRef}
            id={id}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
            disabled={disabled || isUploading}
          />
          <p className="text-xs text-gray-500 mt-1">
            PNG, JPG, GIF, WebP up to {maxSize}MB
          </p>
        </div>
      )}
      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </div>
  )
}

