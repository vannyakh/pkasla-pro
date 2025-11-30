'use client'

import React from 'react'
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import Image from 'next/image'

export interface TemplatePurchase {
  id: string
  userId: string | { id: string; name: string; email: string } | null
  templateId: string | { id: string; name: string; title: string; previewImage?: string } | null
  price: number
  purchaseDate: string
  paymentMethod?: string
  transactionId?: string
}

interface TemplatePurchaseTableProps {
  purchases: TemplatePurchase[]
  currentPage: number
  totalPages: number
  pageSize: number
  startIndex: number
  totalItems: number
  onPageChange: (page: number) => void
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatCurrency = (amount: number) => {
  return `$${amount.toFixed(2)}`
}

const getUserName = (userId: string | { id: string; name: string; email: string } | null) => {
  if (!userId || typeof userId === 'string') return 'Unknown User'
  return userId.name || userId.email || 'Unknown User'
}

const getUserEmail = (userId: string | { id: string; name: string; email: string } | null) => {
  if (!userId || typeof userId === 'string') return ''
  return userId.email || ''
}

const getTemplateName = (templateId: string | { id: string; name: string; title: string; previewImage?: string } | null) => {
  if (!templateId || typeof templateId === 'string') return 'Unknown Template'
  return templateId.title || templateId.name || 'Unknown Template'
}

const getTemplateImage = (templateId: string | { id: string; name: string; title: string; previewImage?: string } | null) => {
  if (!templateId || typeof templateId === 'string') return undefined
  return templateId.previewImage
}

export function TemplatePurchaseTable({
  purchases,
  currentPage,
  totalPages,
  pageSize,
  startIndex,
  totalItems,
  onPageChange,
}: TemplatePurchaseTableProps) {
  const hasNextPage = currentPage < totalPages
  const hasPrevPage = currentPage > 1
  const endIndex = Math.min(startIndex + purchases.length, totalItems)

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-200">
              <TableHead className="text-xs font-semibold text-black">No</TableHead>
              <TableHead className="text-xs font-semibold text-black">Template</TableHead>
              <TableHead className="text-xs font-semibold text-black">User</TableHead>
              <TableHead className="text-xs font-semibold text-black">Price</TableHead>
              <TableHead className="text-xs font-semibold text-black">Payment Method</TableHead>
              <TableHead className="text-xs font-semibold text-black">Transaction ID</TableHead>
              <TableHead className="text-xs font-semibold text-black">Purchase Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-xs text-gray-500">
                  No template purchases found
                </TableCell>
              </TableRow>
            ) : (
              purchases.map((purchase, index) => (
                <TableRow key={purchase.id} className="border-gray-200">
                  <TableCell className="text-xs text-black font-medium">
                    {startIndex + index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTemplateImage(purchase.templateId) ? (
                        <div className="relative h-10 w-10 rounded border border-gray-200 overflow-hidden">
                          <Image
                            src={getTemplateImage(purchase.templateId)!}
                            alt={getTemplateName(purchase.templateId)}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded border border-gray-200 flex items-center justify-center bg-gray-50">
                          <Eye className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-black font-medium">
                          {getTemplateName(purchase.templateId)}
                        </p>
                        {purchase.templateId && typeof purchase.templateId === 'object' && purchase.templateId.name && (
                          <p className="text-xs text-gray-500">{purchase.templateId.name}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-xs text-black font-medium">
                        {getUserName(purchase.userId)}
                      </p>
                      {getUserEmail(purchase.userId) && (
                        <p className="text-xs text-gray-500">{getUserEmail(purchase.userId)}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-black font-medium">
                    {purchase.price === 0 ? (
                      <Badge variant="secondary" className="text-xs">Free</Badge>
                    ) : (
                      <span className="text-green-600 font-semibold">
                        {formatCurrency(purchase.price)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {purchase.paymentMethod ? (
                      <Badge variant="outline" className="text-xs">
                        {purchase.paymentMethod}
                      </Badge>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {purchase.transactionId ? (
                      <code className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {purchase.transactionId.substring(0, 12)}...
                      </code>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-gray-600">
                    {formatDate(purchase.purchaseDate)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {totalItems > 0 && (
        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
          <div className="text-xs text-gray-600">
            Showing {startIndex + 1} to {endIndex} of {totalItems} purchases
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={!hasPrevPage}
              className="h-8 text-xs"
            >
              <ChevronLeft className="h-3 w-3" />
              Previous
            </Button>
            <span className="text-xs text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={!hasNextPage}
              className="h-8 text-xs"
            >
              Next
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </>
  )
}

