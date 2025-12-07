'use client'

import React, { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Eye, Download, CheckCircle2, ShoppingCart, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/shadcn-io/spinner'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useMyTemplatePurchases, type TemplatePurchase } from '@/hooks/api/useTemplatePurchase'
import { useUserTemplate } from '@/hooks/api/useTemplate'

export default function MyTemplatesPage() {
  const [searchInput, setSearchInput] = useState('')
  const { data: purchases = [], isLoading: purchasesLoading } = useMyTemplatePurchases()

  const handleViewPreview = (templateId: string) => {
    window.open(`/templates/preview/${templateId}`, '_blank')
  }

  const handleClearSearch = () => {
    setSearchInput('')
  }

  if (purchasesLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>

        {/* Search Skeleton */}
        <div className="relative">
          <Skeleton className="h-9 w-full rounded-md" />
          <Skeleton className="h-7 w-7 rounded-md absolute right-1 top-1/2 -translate-y-1/2" />
        </div>

        {/* Template Cards Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Card key={item} className="border border-gray-200 shadow-none overflow-hidden p-0">
              {/* Image Preview Skeleton */}
              <div className="relative w-full aspect-3/2 bg-gray-100">
                <Skeleton className="w-full h-full rounded-none" />
                {/* Owned Badge Skeleton */}
                <div className="absolute top-2 right-2">
                  <Skeleton className="h-6 w-20 rounded-full bg-green-200" />
                </div>
              </div>
              <CardContent className="p-4 space-y-2">
                {/* Template Name Skeleton */}
                <Skeleton className="h-4 w-40" />
                {/* Category Skeleton */}
                <Skeleton className="h-3 w-32" />
                {/* Purchase Date Skeleton */}
                <Skeleton className="h-3 w-36" />
                {/* Action Buttons Skeleton */}
                <div className="flex items-center gap-2 pt-2">
                  <Skeleton className="flex-1 h-8 rounded-md" />
                  <Skeleton className="flex-1 h-8 rounded-md" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-black">គំរូរបស់ខ្ញុំ (My Templates)</h1>
        <p className="text-sm text-gray-600 mt-1">
          គំរូដែលអ្នកបានទិញ
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="ស្វែងរកគំរូ..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-9 pr-9 h-9 text-sm"
        />
        {searchInput && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
            onClick={handleClearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Templates Grid */}
      {purchases.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-600 mb-2">
            អ្នកមិនទាន់មានគំរូទេ
          </p>
          <p className="text-sm text-gray-500 mb-6">
            ទិញគំរូពីហាងដើម្បីចាប់ផ្តើម
          </p>
          <Link href="/dashboard/stores">
            <Button className="bg-pink-500 hover:bg-pink-600">
              <ShoppingCart className="h-4 w-4 mr-2" />
              ទៅហាងគំរូ
            </Button>
          </Link>
        </div>
      ) : (
        <TemplatesGrid
          purchases={purchases}
          searchInput={searchInput}
          onViewPreview={handleViewPreview}
        />
      )}
    </div>
  )
}

interface TemplatesGridProps {
  purchases: TemplatePurchase[]
  searchInput: string
  onViewPreview: (templateId: string) => void
}

function TemplatesGrid({ purchases, searchInput, onViewPreview }: TemplatesGridProps) {
  const filteredCards = purchases
    .map((purchase) => (
      <TemplateCard
        key={purchase.id}
        purchase={purchase}
        searchInput={searchInput}
        onViewPreview={onViewPreview}
      />
    ))
    .filter((card) => card !== null)

  if (filteredCards.length === 0 && searchInput) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-gray-600">មិនឃើញគំរូដែលត្រូវនឹងការស្វែងរក</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredCards}
    </div>
  )
}

interface TemplateCardProps {
  purchase: TemplatePurchase
  searchInput: string
  onViewPreview: (templateId: string) => void
}

function TemplateCard({ purchase, searchInput, onViewPreview }: TemplateCardProps) {
  // Ensure templateId is a string (handle case where backend returns object)
  const templateId = getTemplateId(purchase.templateId)
  
  const { data: template, isLoading } = useUserTemplate(templateId)

  // Filter by search input
  const matchesSearch = useMemo(() => {
    if (!searchInput || !template) return true
    const searchLower = searchInput.toLowerCase()
    return (
      template.name.toLowerCase().includes(searchLower) ||
      template.title?.toLowerCase().includes(searchLower) ||
      template.category?.toLowerCase().includes(searchLower)
    )
  }, [template, searchInput])

  if (!matchesSearch) {
    return null
  }

  if (isLoading) {
    return (
      <Card className="border border-gray-200 shadow-none overflow-hidden p-0">
        <div className="w-full aspect-3/2 bg-gray-100 flex items-center justify-center">
          <Spinner className="h-6 w-6" />
        </div>
      </Card>
    )
  }

  if (!template) {
    return null
  }

  return (
    <Card className="border border-gray-200 shadow-none overflow-hidden p-0">
      <div className="relative w-full aspect-3/2 bg-linear-to-br from-amber-50 to-orange-50 overflow-hidden">
        {template.previewImage ? (
          <Image
            src={template.previewImage}
            alt={template.name}
            fill
            className="object-cover aspect-3/2"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-4">
            <div className="w-full h-full bg-white rounded-lg shadow-sm flex items-center justify-center">
              <p className="text-xs text-gray-400 text-center px-4">
                {template.name}
              </p>
            </div>
          </div>
        )}
        {/* Owned Badge */}
        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          <span className="text-xs font-medium">Owned</span>
        </div>
      </div>
      <CardContent className="p-4 space-y-1">
        {/* Template Name */}
        <div>
          <p className="text-sm font-semibold text-black line-clamp-1">
            {template.name}
          </p>
        </div>

        {/* Category */}
        {template.category && (
          <div>
            <p className="text-xs text-gray-600">ប្រភេទ៖ {template.category}</p>
          </div>
        )}

        {/* Purchase Date */}
        <div>
          <p className="text-xs text-gray-500">
            ទិញនៅ៖ {new Date(purchase.purchaseDate).toLocaleDateString('km-KH')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs h-8 border-gray-300"
            onClick={() => onViewPreview(templateId)}
          >
            <Eye className="h-3.5 w-3.5 mr-1.5" />
            មើល
          </Button>
          <Button
            size="sm"
            className="flex-1 text-xs h-8 bg-pink-500 hover:bg-pink-600 text-white"
            asChild
          >
            <Link href={`/dashboard/events/new?template=${template.id}`}>
              <Download className="h-3.5 w-3.5 mr-1.5" />
              ប្រើ
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Helper function to extract template ID safely
function getTemplateId(templateId: string | { _id?: unknown; id?: unknown } | unknown): string {
  if (typeof templateId === 'string') {
    return templateId
  }
  if (templateId && typeof templateId === 'object') {
    const obj = templateId as { _id?: unknown; id?: unknown }
    if (obj._id) {
      return String(obj._id)
    }
    if (obj.id) {
      return String(obj.id)
    }
  }
  return String(templateId)
}

