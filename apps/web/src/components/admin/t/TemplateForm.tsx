'use client'

import React, { useState, useEffect } from 'react'
import { Upload, X, Loader2 } from 'lucide-react'
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
import { Template, TemplateFormData } from '@/types/template'
import { api } from '@/lib/axios-client'

interface TemplateFormProps {
  template?: Template
  onSubmit: (data: TemplateFormData) => Promise<void>
  onCancel?: () => void
  isSubmitting?: boolean
}

const CATEGORIES = ['Wedding', 'Business', 'Personal', 'Event', 'Other']

export function TemplateForm({
  template,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: TemplateFormProps) {
  const [formData, setFormData] = useState<TemplateFormData>({
    name: '',
    title: '',
    category: '',
    price: '',
    isPremium: false,
    previewImage: null,
    slug: '',
    variables: [],
    assets: {
      images: [],
      colors: [],
      fonts: [],
    },
  })
  const [preview, setPreview] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        title: template.title,
        category: template.category || '',
        price: template.price || '',
        isPremium: template.isPremium,
        previewImage: null,
        slug: template.slug || '',
        variables: template.variables || [],
        assets: template.assets || {
          images: [],
          colors: [],
          fonts: [],
        },
      })
      if (template.previewImage) {
        setPreview(template.previewImage)
        setUploadedImageUrl(template.previewImage)
      }
    }
  }, [template])

  const handleInputChange = (field: keyof TemplateFormData, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, previewImage: 'Please select an image file' }))
      return
    }

    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, previewImage: 'Image size must be less than 5MB' }))
      return
    }

    // Clear previous errors
    setErrors((prev) => ({ ...prev, previewImage: '' }))
    
    // Create preview immediately
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload file to server
    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'templates')

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
      }>('/upload/single', formData, (progress) => {
        setUploadProgress(progress)
      })

      if (response.success && response.data) {
        setUploadedImageUrl(response.data.url)
        setFormData((prev) => ({ ...prev, previewImage: file }))
      } else {
        throw new Error(response.error || 'Failed to upload image')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image'
      setErrors((prev) => ({ ...prev, previewImage: errorMessage }))
      setPreview(null)
      setUploadedImageUrl(null)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, previewImage: null }))
    setUploadedImageUrl(null)
    setPreview(template?.previewImage || null)
    if (template?.previewImage) {
      setUploadedImageUrl(template.previewImage)
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (formData.price !== '' && (isNaN(Number(formData.price)) || Number(formData.price) < 0)) {
      newErrors.price = 'Price must be a valid positive number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) {
      return
    }

    // Pass formData with the uploaded URL if available, otherwise pass the File
    await onSubmit({
      ...formData,
      previewImage: uploadedImageUrl || formData.previewImage,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div>
        <Label htmlFor="name" className="text-sm font-semibold text-black mb-2 block">
          Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="e.g., wedding-template-01"
          className="h-10 text-sm"
          disabled={isSubmitting}
        />
        {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
      </div>

      {/* Title */}
      <div>
        <Label htmlFor="title" className="text-sm font-semibold text-black mb-2 block">
          Title <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="e.g., Elegant Wedding Invitation"
          className="h-10 text-sm"
          disabled={isSubmitting}
        />
        {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
      </div>

      {/* Category */}
      <div>
        <Label htmlFor="category" className="text-sm font-semibold text-black mb-2 block">
          Category
        </Label>
        <Select
          value={formData.category}
          onValueChange={(value) => handleInputChange('category', value)}
          disabled={isSubmitting}
        >
          <SelectTrigger className="h-10 text-sm">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price */}
      <div>
        <Label htmlFor="price" className="text-sm font-semibold text-black mb-2 block">
          Price
        </Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          min="0"
          value={formData.price}
          onChange={(e) => handleInputChange('price', e.target.value === '' ? '' : Number(e.target.value))}
          placeholder="0.00"
          className="h-10 text-sm"
          disabled={isSubmitting}
        />
        {errors.price && <p className="text-xs text-red-600 mt-1">{errors.price}</p>}
      </div>

      {/* Slug */}
      <div>
        <Label htmlFor="slug" className="text-sm font-semibold text-black mb-2 block">
          Slug (Route Name)
        </Label>
        <Input
          id="slug"
          value={formData.slug || ''}
          onChange={(e) => handleInputChange('slug', e.target.value)}
          placeholder="e.g., classic-gold, modern-minimal"
          className="h-10 text-sm"
          disabled={isSubmitting}
        />
        <p className="text-xs text-gray-500 mt-1">
          Unique identifier for the template route (lowercase, hyphens only)
        </p>
      </div>

      {/* Variables */}
      <div>
        <Label htmlFor="variables" className="text-sm font-semibold text-black mb-2 block">
          Available Variables (comma-separated)
        </Label>
        <Input
          id="variables"
          value={formData.variables?.join(', ') || ''}
          onChange={(e) => {
            const vars = e.target.value.split(',').map(v => v.trim()).filter(Boolean)
            setFormData(prev => ({ ...prev, variables: vars }))
          }}
          placeholder="e.g., event.title, guest.name, event.date"
          className="h-10 text-sm"
          disabled={isSubmitting}
        />
        <p className="text-xs text-gray-500 mt-1">
          List of variables that can be used in this template
        </p>
      </div>

      {/* Is Premium */}
      <div className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg bg-gray-50">
        <Checkbox
          id="isPremium"
          checked={formData.isPremium}
          onCheckedChange={(checked) => handleInputChange('isPremium', checked as boolean)}
          disabled={isSubmitting}
        />
        <Label
          htmlFor="isPremium"
          className="text-sm font-medium text-black cursor-pointer"
        >
          Premium Template
        </Label>
      </div>

      {/* Preview Image */}
      <div>
        <Label className="text-sm font-semibold text-black mb-2 block">
          Preview Image
        </Label>
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
              onClick={removeImage}
              className="absolute top-2 right-2 h-8 w-8 p-0"
              disabled={isSubmitting || isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <Label
              htmlFor="previewImage"
              className="cursor-pointer text-sm text-gray-600 hover:text-gray-900"
            >
              Click to upload or drag and drop
            </Label>
            <Input
              id="previewImage"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={isSubmitting || isUploading}
            />
            <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
          </div>
        )}
        {errors.previewImage && (
          <p className="text-xs text-red-600 mt-1">{errors.previewImage}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="h-10"
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting} className="h-10">
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {template ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            template ? 'Update Template' : 'Create Template'
          )}
        </Button>
      </div>
    </form>
  )
}

