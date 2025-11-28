'use client'

import React from 'react'
import Image from 'next/image'
import { Eye, ShoppingCart } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Template {
  id: string
  name: string
  image: string
  price: number
  category: string
  previewUrl?: string
}

interface SampleTemplateProps {
  templates?: Template[]
  onViewSample?: (templateId: string) => void
  onBuyNow?: (templateId: string) => void
}

export default function SampleTemplate({
  templates = [],
  onViewSample,
  onBuyNow,
}: SampleTemplateProps) {
  const defaultTemplates: Template[] = [
    {
      id: '1',
      name: 'សិរីមង្គលអាពាហ៍ពិពាហ៍',
      image: '/placeholder-template-1.jpg',
      price: 11.11,
      category: 'ប្រភេទ៖ ពិធីរៀបមង្គលការ',
    },
    {
      id: '2',
      name: 'សុវត្ថារ៉ូ & អេងលី',
      image: '/placeholder-template-2.jpg',
      price: 11.11,
      category: 'ប្រភេទ៖ ពិធីរៀបមង្គលការ',
    },
  ]

  const displayTemplates = templates.length > 0 ? templates : defaultTemplates

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayTemplates.map((template) => (
          <Card key={template.id} className="border border-gray-200 shadow-none overflow-hidden p-0">
            <div className="relative w-full aspect-[3/4] bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden">
              {/* Template Preview Image */}
              {template.image ? (
                <Image
                  src={template.image}
                  alt={template.name}
                  fill
                  className="object-cover"
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
            </div>
            <CardContent className="p-4 space-y-3">
              {/* Price */}
              <div>
                <p className="text-sm font-semibold text-red-600">
                  តម្លៃ៖ ${template.price.toFixed(2)}
                </p>
              </div>

              {/* Category */}
              <div>
                <p className="text-xs text-black">{template.category}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs h-8 border-gray-300"
                  onClick={() => onViewSample?.(template.id)}
                >
                  <Eye className="h-3.5 w-3.5 mr-1.5" />
                  មើលសាក
                </Button>
                <Button
                  size="sm"
                  className="flex-1 text-xs h-8 bg-pink-500 hover:bg-pink-600 text-white"
                  onClick={() => onBuyNow?.(template.id)}
                >
                  <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                  ទិញឥឡូវ
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {displayTemplates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-gray-600">មិនទាន់មានគំរូ</p>
        </div>
      )}
    </div>
  )
}

