'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TemplatePurchaseTable } from '@/components/admin/templatepurchases/TemplatePurchaseTable'
import { TemplatePurchaseToolbar } from '@/components/admin/templatepurchases/TemplatePurchaseToolbar'
import { TemplatePurchaseStats } from '@/components/admin/templatepurchases/TemplatePurchaseStats'
import { Spinner } from '@/components/ui/shadcn-io/spinner'
import { useTemplatePurchases, useTemplatePurchaseRevenue } from '@/hooks/api/useTemplatePurchase'

const ITEMS_PER_PAGE = 10

export default function TemplatePurchasesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Build filters for API
  const filters = useMemo(() => {
    const apiFilters: {
      page: number
      pageSize: number
      search?: string
    } = {
      page: currentPage,
      pageSize: ITEMS_PER_PAGE,
    }

    if (searchTerm) {
      apiFilters.search = searchTerm
    }

    return apiFilters
  }, [currentPage, searchTerm])

  // Fetch template purchases from API
  const { data: purchasesData, isLoading } = useTemplatePurchases(filters)
  const { data: revenueData } = useTemplatePurchaseRevenue()

  const purchases = purchasesData?.items || []
  const totalItems = purchasesData?.total || 0
  const totalPages = purchasesData ? Math.ceil(purchasesData.total / purchasesData.pageSize) : 0
  const startIndex = purchasesData ? (purchasesData.page - 1) * purchasesData.pageSize : 0

  // Calculate stats
  const totalRevenue = revenueData?.totalRevenue || 0
  const totalPurchases = totalItems
  const uniqueUsers = new Set(purchases.map(p => {
    const userId = typeof p.userId === 'string' ? p.userId : p.userId.id
    return userId
  })).size
  const averagePurchase = totalPurchases > 0 ? totalRevenue / totalPurchases : 0

  // Handlers
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    if (currentPage !== 1) setCurrentPage(1)
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    if (currentPage !== 1) setCurrentPage(1)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
        <span className="ml-2 text-xs text-gray-600">Loading template purchases...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-semibold text-black">Template Purchases</h1>
        <p className="text-xs text-gray-600 mt-1">
          View and manage all template purchases
        </p>
      </div>

      {/* Stats Cards */}
      <TemplatePurchaseStats
        totalRevenue={totalRevenue}
        totalPurchases={totalPurchases}
        totalUsers={uniqueUsers}
        averagePurchase={averagePurchase}
      />

      <Card className="border border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4">
            <CardTitle className="text-sm font-semibold text-black">
              All Purchases ({totalItems})
            </CardTitle>
            <TemplatePurchaseToolbar
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              onClearSearch={handleClearSearch}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {purchases.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-xs text-gray-500 mb-4">No template purchases found</p>
            </div>
          ) : (
            <TemplatePurchaseTable
              purchases={purchases}
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={ITEMS_PER_PAGE}
              startIndex={startIndex}
              totalItems={totalItems}
              onPageChange={setCurrentPage}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
