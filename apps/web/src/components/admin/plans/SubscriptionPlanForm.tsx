'use client'

import React, { useState, useEffect } from 'react'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { SubscriptionPlan, CreateSubscriptionPlanDto, UpdateSubscriptionPlanDto } from '@/types/subscription-plan'

interface SubscriptionPlanFormProps {
  plan?: SubscriptionPlan
  onSubmit: (data: CreateSubscriptionPlanDto | UpdateSubscriptionPlanDto) => Promise<void>
  onCancel?: () => void
  isSubmitting?: boolean
}

export function SubscriptionPlanForm({
  plan,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: SubscriptionPlanFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    price: '',
    billingCycle: 'monthly' as 'monthly' | 'yearly',
    maxEvents: '',
    features: [] as string[],
    isActive: true,
  })
  const [newFeature, setNewFeature] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (plan) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        name: plan.name,
        displayName: plan.displayName,
        description: plan.description || '',
        price: plan.price.toString(),
        billingCycle: plan.billingCycle,
        maxEvents: plan.maxEvents === null ? '' : plan.maxEvents.toString(),
        features: plan.features || [],
        isActive: plan.isActive,
      })
    }
  }, [plan])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, newFeature.trim()],
      }))
      setNewFeature('')
    }
  }

  const handleRemoveFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }))
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!plan && !formData.name.trim()) {
      newErrors.name = 'Plan name is required'
    } else if (!plan && !/^[a-z0-9-]+$/.test(formData.name)) {
      newErrors.name = 'Name must contain only lowercase letters, numbers, and hyphens'
    }

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required'
    }

    if (!formData.price || parseFloat(formData.price) < 0) {
      newErrors.price = 'Price must be a positive number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    const submitData: CreateSubscriptionPlanDto | UpdateSubscriptionPlanDto = plan
      ? {
          displayName: formData.displayName,
          description: formData.description || undefined,
          price: parseFloat(formData.price),
          billingCycle: formData.billingCycle,
          maxEvents: formData.maxEvents === '' ? null : parseInt(formData.maxEvents, 10),
          features: formData.features,
          isActive: formData.isActive,
        }
      : {
          name: formData.name.toLowerCase(),
          displayName: formData.displayName,
          description: formData.description || undefined,
          price: parseFloat(formData.price),
          billingCycle: formData.billingCycle,
          maxEvents: formData.maxEvents === '' ? null : parseInt(formData.maxEvents, 10),
          features: formData.features,
          isActive: formData.isActive,
        }

    await onSubmit(submitData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!plan && (
        <div className="space-y-2">
          <Label htmlFor="name" className="text-xs font-semibold">
            Plan Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="e.g., basic, pro, premium"
            className="h-9 text-xs"
            disabled={isSubmitting}
          />
          {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
          <p className="text-xs text-gray-500">
            Lowercase letters, numbers, and hyphens only. This cannot be changed after creation.
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="displayName" className="text-xs font-semibold">
          Display Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="displayName"
          value={formData.displayName}
          onChange={(e) => handleInputChange('displayName', e.target.value)}
          placeholder="e.g., Basic Plan, Pro Plan"
          className="h-9 text-xs"
          disabled={isSubmitting}
        />
        {errors.displayName && <p className="text-xs text-red-600">{errors.displayName}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-xs font-semibold">
          Description
        </Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Plan description..."
          className="text-xs min-h-[80px]"
          disabled={isSubmitting}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price" className="text-xs font-semibold">
            Price ($) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) => handleInputChange('price', e.target.value)}
            placeholder="0.00"
            className="h-9 text-xs"
            disabled={isSubmitting}
          />
          {errors.price && <p className="text-xs text-red-600">{errors.price}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="billingCycle" className="text-xs font-semibold">
            Billing Cycle <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.billingCycle}
            onValueChange={(value) => handleInputChange('billingCycle', value)}
            disabled={isSubmitting}
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="maxEvents" className="text-xs font-semibold">
          Max Events
        </Label>
        <Input
          id="maxEvents"
          type="number"
          min="0"
          value={formData.maxEvents}
          onChange={(e) => handleInputChange('maxEvents', e.target.value)}
          placeholder="Leave empty for unlimited"
          className="h-9 text-xs"
          disabled={isSubmitting}
        />
        <p className="text-xs text-gray-500">Leave empty for unlimited events</p>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-semibold">Features</Label>
        <div className="flex gap-2">
          <Input
            value={newFeature}
            onChange={(e) => setNewFeature(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddFeature()
              }
            }}
            placeholder="Add a feature..."
            className="h-9 text-xs"
            disabled={isSubmitting}
          />
          <Button
            type="button"
            onClick={handleAddFeature}
            size="sm"
            variant="outline"
            className="h-9 text-xs"
            disabled={isSubmitting || !newFeature.trim()}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        {formData.features.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs"
              >
                <span>{feature}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveFeature(index)}
                  className="text-gray-500 hover:text-red-600"
                  disabled={isSubmitting}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => handleInputChange('isActive', checked === true)}
          disabled={isSubmitting}
        />
        <Label htmlFor="isActive" className="text-xs font-medium cursor-pointer">
          Active (visible to users)
        </Label>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting} className="h-9 text-xs">
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting} className="h-9 text-xs">
          {isSubmitting ? 'Saving...' : plan ? 'Update Plan' : 'Create Plan'}
        </Button>
      </div>
    </form>
  )
}

