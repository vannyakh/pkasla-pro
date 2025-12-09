'use client'

import React, { useMemo, useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react'
import confetti from 'canvas-confetti'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Stores from '@/components/events/tabs/Stores'
import TemplatePaymentDialog from '@/components/templates/TemplatePaymentDialog'
import { useUserTemplates, useUserTemplateCategories } from '@/hooks/api/useTemplate'
import { useTemplateStore } from '@/store/templates'
import type { Template as APITemplate } from '@/types/template'
import PageLoading from '@/components/PageLoading'

export default function StoresPage() {
  const { filters, setPage, setSearch, setCategory, setIsPremium, resetFilters } = useTemplateStore()
  const [searchInput, setSearchInput] = useState(filters.search || '')
  const [selectedTemplate, setSelectedTemplate] = useState<APITemplate | null>(null)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const { data: categories = [] } = useUserTemplateCategories()

  // Fetch templates using the store filters
  const { data: templatesData, isLoading } = useUserTemplates(filters)

  const totalItems = templatesData?.total || 0
  const totalPages = templatesData ? Math.ceil(templatesData.total / (templatesData.pageSize || 12)) : 0
  const currentPage = templatesData?.page || 1
  const hasNextPage = currentPage < totalPages
  const hasPrevPage = currentPage > 1

  // Map API templates to Stores component format
  const mappedTemplates = useMemo(() => {
    const templates = templatesData?.items || []
    return templates.map((template: APITemplate) => ({
      id: template.id,
      name: template.name,
      image: template.previewImage || '/placeholder-template.jpg',
      price: template.price || 0,
      category: template.category 
        ? `ប្រភេទ៖ ${template.category}` 
        : 'ប្រភេទ៖ ទូទៅ',
      previewUrl: template.previewImage,
    }))
  }, [templatesData?.items])

  const handleViewSample = (templateId: string) => {
    window.open(`/templates/preview/${templateId}`, '_blank')
  }

  const handleBuyNow = (templateId: string) => {
    const template = templatesData?.items?.find((t) => t.id === templateId)
    if (template) {
      setSelectedTemplate(template)
      setIsPaymentDialogOpen(true)
    }
  }

  // Confetti celebration function
  const triggerConfetti = useCallback(() => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: NodeJS.Timeout = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      // Launch confetti from both sides
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
  }, []);

  const handlePurchaseSuccess = () => {
    // Trigger confetti celebration
    triggerConfetti();
    // Refresh templates list after purchase
    // The query will automatically refetch
    setIsPaymentDialogOpen(false)
    setSelectedTemplate(null)
  }

  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    setSearch(value)
  }

  const handleSearchClear = () => {
    setSearchInput('')
    setSearch(undefined)
  }

  const hasActiveFilters = filters.search || filters.category || filters.isPremium !== undefined

  const handleResetFilters = () => {
    setSearchInput('')
    resetFilters()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-black">ហាងគំរូ (Template Store)</h1>
        <p className="text-sm text-gray-600 mt-1">
          ជ្រើសរើសគំរូអញ្ជើញសម្រាប់ពិធីរបស់អ្នក
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="ស្វែងរកគំរូ..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 pr-9 h-9 text-sm"
          />
          {searchInput && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
              onClick={handleSearchClear}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Select
          value={filters.category || 'all'}
          onValueChange={(value) => setCategory(value)}
        >
          <SelectTrigger className="w-full sm:w-40 h-9 text-sm">
            <SelectValue placeholder="ប្រភេទ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ប្រភេទទាំងអស់</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.isPremium === undefined ? 'all' : filters.isPremium ? 'premium' : 'free'}
          onValueChange={(value) => setIsPremium(value === 'all' ? undefined : value === 'premium')}
        >
          <SelectTrigger className="w-full sm:w-32 h-9 text-sm">
            <SelectValue placeholder="ប្រភេទតម្លៃ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ទាំងអស់</SelectItem>
            <SelectItem value="premium">ពិសេស</SelectItem>
            <SelectItem value="free">ឥតគិតថ្លៃ</SelectItem>
          </SelectContent>
        </Select>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetFilters}
            className="h-9 text-sm"
          >
            <X className="h-4 w-4 mr-1" />
            សម្អាត
          </Button>
        )}
      </div>

      {isLoading ? (
         <div className="flex items-center justify-center">
         <div className="text-center space-y-4">
           <PageLoading fullScreen={false} size="sm" text="Loading..." />
         </div>
       </div>
      ) : (
        <>
          <Stores
            templates={mappedTemplates}
            onViewSample={handleViewSample}
            onBuyNow={handleBuyNow}
          />

          {/* Pagination */}
          {totalItems > 0 && (
            <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
              <div className="text-xs text-gray-600">
                បង្ហាញ {(currentPage - 1) * (filters.pageSize || 12) + 1} ដល់{' '}
                {Math.min(currentPage * (filters.pageSize || 12), totalItems)} នៃ {totalItems} គំរូ
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(1, currentPage - 1))}
                  disabled={!hasPrevPage || isLoading}
                  className="h-8 text-xs"
                >
                  <ChevronLeft className="h-3 w-3" />
                  មុន
                </Button>
                <span className="text-xs text-gray-600">
                  ទំព័រ {currentPage} នៃ {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                  disabled={!hasNextPage || isLoading}
                  className="h-8 text-xs"
                >
                  បន្ទាប់
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Payment Dialog */}
      <TemplatePaymentDialog
        template={selectedTemplate}
        open={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        onSuccess={handlePurchaseSuccess}
      />
    </div>
  )
}
