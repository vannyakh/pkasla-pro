'use client'

import React from 'react'
import { ChevronLeft, ChevronRight, Edit, Trash2, Image as ImageIcon } from 'lucide-react'
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
import { Template } from '@/types/template'
import { useRouter } from 'next/navigation'

interface TemplateTableProps {
  templates: Template[]
  currentPage: number
  totalPages: number
  pageSize: number
  startIndex: number
  totalItems: number
  onPageChange: (page: number) => void
  onDelete: (id: string) => void
  isDeleting?: boolean
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const formatCurrency = (amount?: number) => {
  if (!amount) return 'Free'
  return `$${amount.toFixed(2)}`
}

export function TemplateTable({
  templates,
  currentPage,
  totalPages,
  pageSize,
  startIndex,
  totalItems,
  onPageChange,
  onDelete,
  isDeleting = false,
}: TemplateTableProps) {
  const router = useRouter()
  const hasNextPage = currentPage < totalPages
  const hasPrevPage = currentPage > 1
  const endIndex = Math.min(startIndex + templates.length, totalItems)

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-200">
              <TableHead className="text-xs font-semibold text-black">No</TableHead>
              <TableHead className="text-xs font-semibold text-black">Preview</TableHead>
              <TableHead className="text-xs font-semibold text-black">Name</TableHead>
              <TableHead className="text-xs font-semibold text-black">Slug</TableHead>
              <TableHead className="text-xs font-semibold text-black">Variables</TableHead>
              <TableHead className="text-xs font-semibold text-black">Title</TableHead>
              <TableHead className="text-xs font-semibold text-black">Category</TableHead>
              <TableHead className="text-xs font-semibold text-black">Price</TableHead>
              <TableHead className="text-xs font-semibold text-black">Premium</TableHead>
              <TableHead className="text-xs font-semibold text-black">Created</TableHead>
              <TableHead className="text-xs font-semibold text-black">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-8 text-xs text-gray-500">
                  No templates found
                </TableCell>
              </TableRow>
            ) : (
              templates.map((template, index) => (
                <TableRow key={template.id} className="border-gray-200">
                  <TableCell className="text-xs text-black font-medium">
                    {startIndex + index + 1}
                  </TableCell>
                  <TableCell>
                    {template.previewImage ? (
                      <img
                        src={template.previewImage}
                        alt={template.title}
                        className="h-12 w-12 object-cover rounded border border-gray-200"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded border border-gray-200 flex items-center justify-center bg-gray-50">
                        <ImageIcon className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-black font-medium">{template.name}</TableCell>
                  <TableCell className="text-xs text-gray-600">
                    {template.slug ? (
                      <code className="px-2 py-1 bg-gray-100 rounded text-xs">{template.slug}</code>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-gray-600">
                    {template.variables && template.variables.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {template.variables.slice(0, 2).map((v, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {v}
                          </Badge>
                        ))}
                        {template.variables.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.variables.length - 2}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-gray-600">{template.title}</TableCell>
                  <TableCell>
                    {template.category ? (
                      <Badge variant="outline" className="text-xs">
                        {template.category}
                      </Badge>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-black font-medium">
                    {formatCurrency(template.price)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={template.isPremium ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {template.isPremium ? 'Premium' : 'Free'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-gray-600">
                    {formatDate(template.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/admin/t/edit/${template.id}`)}
                        className="h-7 w-7 p-0"
                        disabled={isDeleting}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(template.id)}
                        className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
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
            Showing {startIndex + 1} to {endIndex} of {totalItems} templates
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

