'use client'

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTemplate } from '@/hooks/api/useTemplate'
import { Spinner } from '@/components/ui/shadcn-io/spinner'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function TemplatePreviewPage() {
  const params = useParams()
  const router = useRouter()
  const templateId = params?.id as string
  const { data: template, isLoading } = useTemplate(templateId)

  // Create sample data for preview
  const sampleEvent = {
    title: 'Sample Wedding Celebration',
    description: 'You are cordially invited to join us for a special celebration of love and joy.',
    date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    venue: 'Grand Ballroom, Hotel Example',
    googleMapLink: 'https://maps.google.com',
    coverImage: template?.previewImage,
  }

  const sampleGuest = {
    name: 'John Doe',
    email: 'john@example.com',
    inviteToken: 'sample-preview-token',
  }

  const sampleAssets = {
    images: {},
    colors: {},
    fonts: {},
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

  // If template has a slug, redirect to slug-based preview
  if (template.slug) {
    const params = new URLSearchParams({
      event: JSON.stringify(sampleEvent),
      guest: JSON.stringify(sampleGuest),
      assets: JSON.stringify(sampleAssets),
    })
    
    // Use window.location for client-side redirect to preserve query params
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line react-hooks/immutability
      window.location.href = `/templates/base/${template.slug}?${params.toString()}`
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Spinner className="h-8 w-8" />
        </div>
      )
    }
  }

  // Fallback: show old preview component if no slug
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard/stores">
              <Button variant="ghost" size="sm" className="text-xs">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Store
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-600 mb-4">Template preview requires a slug to be set.</p>
          <p className="text-sm text-gray-500">
            Please set a slug for this template in the admin panel.
          </p>
        </div>
      </div>
    </div>
  )
}

