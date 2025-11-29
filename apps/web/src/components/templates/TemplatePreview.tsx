'use client'

import React from 'react'
import Image from 'next/image'
import { ArrowLeft, Download, Share2, Lock, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/shadcn-io/spinner'
import { useTemplate } from '@/hooks/api/useTemplate'
import { useCheckTemplateOwnership } from '@/hooks/api/useTemplatePurchase'
import Link from 'next/link'

interface TemplatePreviewProps {
  templateId: string
}

export default function TemplatePreview({ templateId }: TemplatePreviewProps) {
  const { data: template, isLoading: templateLoading } = useTemplate(templateId)
  const { data: ownsTemplate, isLoading: ownershipLoading } = useCheckTemplateOwnership(templateId)

  const isLoading = templateLoading || ownershipLoading
  const showWatermark = !ownsTemplate && template

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      const url = window.location.href
      navigator.clipboard.writeText(url)
      // You can add a toast notification here
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!template) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">Template not found</p>
          <Link href="/dashboard/stores">
            <Button variant="outline">Back to Store</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/stores">
                <Button variant="ghost" size="sm" className="text-xs">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Store
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-black">{template.name}</h1>
                {template.category && (
                  <p className="text-xs text-gray-500">{template.category}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {ownsTemplate && (
                <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-green-700 font-medium">Owned</span>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="text-xs"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              {!ownsTemplate && (
                <Link href={`/dashboard/stores?template=${templateId}`}>
                  <Button size="sm" className="text-xs bg-pink-500 hover:bg-pink-600">
                    <Lock className="h-4 w-4 mr-2" />
                    Purchase
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Template Preview Image */}
          <div className="relative w-full bg-gradient-to-br from-amber-50 to-orange-50" style={{ aspectRatio: '3/4' }}>
            {template.previewImage ? (
              <>
                <Image
                  src={template.previewImage}
                  alt={template.name}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                  priority
                />
                {/* Watermark Overlay */}
                {showWatermark && (
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Diagonal Watermark Pattern */}
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{
                        backgroundImage: `repeating-linear-gradient(
                          45deg,
                          transparent,
                          transparent 100px,
                          rgba(0, 0, 0, 0.1) 100px,
                          rgba(0, 0, 0, 0.1) 200px
                        )`,
                      }}
                    />
                    {/* Watermark Text */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="transform -rotate-45 text-center">
                        <div className="text-6xl font-bold text-gray-400 opacity-30 select-none">
                          PREVIEW
                        </div>
                        <div className="text-2xl font-semibold text-gray-500 opacity-40 mt-2 select-none">
                          {template.name}
                        </div>
                      </div>
                    </div>
                    {/* Lock Icon Overlay */}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
                      <Lock className="h-6 w-6 text-gray-600" />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-400 text-lg">{template.name}</p>
                  <p className="text-gray-300 text-sm mt-2">No preview available</p>
                </div>
              </div>
            )}
          </div>

          {/* Template Info */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-black">{template.title || template.name}</h2>
                {template.category && (
                  <p className="text-sm text-gray-600 mt-1">Category: {template.category}</p>
                )}
              </div>
              <div className="text-right">
                {template.price !== undefined && template.price > 0 ? (
                  <p className="text-2xl font-bold text-red-600">${template.price.toFixed(2)}</p>
                ) : (
                  <p className="text-lg font-semibold text-green-600">Free</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
              {ownsTemplate ? (
                <>
                  <Button variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button className="flex-1 bg-pink-500 hover:bg-pink-600">
                    Use Template
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Preview
                  </Button>
                  <Link href={`/dashboard/stores?template=${templateId}`} className="flex-1">
                    <Button className="w-full bg-pink-500 hover:bg-pink-600">
                      <Lock className="h-4 w-4 mr-2" />
                      Purchase to Unlock
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Notice for non-owners */}
            {showWatermark && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Lock className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900">
                      This is a preview version
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      Purchase this template to remove the watermark and get full access to use it for your events.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

