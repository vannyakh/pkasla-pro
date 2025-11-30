'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/shadcn-io/spinner'
import { useTemplates } from '@/hooks/api/useTemplate'
import { useEvent, useUpdateEvent } from '@/hooks/api/useEvent'
import { CheckCircle2, Eye, Palette, Type, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'

interface TemplatesProps {
  eventId: string
}

export default function Templates({ eventId }: TemplatesProps) {
  const { data: event, isLoading: eventLoading } = useEvent(eventId)
  const { data: templatesData, isLoading: templatesLoading } = useTemplates({ pageSize: 100 })
  const updateEvent = useUpdateEvent()
  const [selectedTemplateSlug, setSelectedTemplateSlug] = useState<string | null>(null)
  const [isCustomizing, setIsCustomizing] = useState(false)
  const [customization, setCustomization] = useState<{
    colors: Record<string, string>
    fonts: Record<string, string>
    images: Record<string, string>
  }>({
    colors: {},
    fonts: {},
    images: {},
  })

  const templates = templatesData?.items || []
  const currentTemplate = templates.find(t => t.slug === event?.templateSlug)
  const selectedTemplate = templates.find(t => t.slug === selectedTemplateSlug)

  React.useEffect(() => {
    if (event?.templateSlug) {
      setSelectedTemplateSlug(event.templateSlug)
    }
    if (event?.userTemplateConfig) {
      setCustomization({
        colors: event.userTemplateConfig.colors || {},
        fonts: event.userTemplateConfig.fonts || {},
        images: event.userTemplateConfig.images || {},
      })
    }
  }, [event])

  const handleSelectTemplate = async (slug: string) => {
    try {
      await updateEvent.mutateAsync({
        id: eventId,
        data: {
          templateSlug: slug,
        },
      })
      setSelectedTemplateSlug(slug)
      // Toast is handled by the mutation's onSuccess callback
    } catch {
      toast.error('Failed to select template')
    }
  }

  const handleSaveCustomization = async () => {
    if (!selectedTemplateSlug) {
      toast.error('Please select a template first')
      return
    }

    try {
      await updateEvent.mutateAsync({
        id: eventId,
        data: {
          userTemplateConfig: {
            colors: customization.colors,
            fonts: customization.fonts,
            images: customization.images,
          },
        },
      })
      // Toast is handled by the mutation's onSuccess callback
      setIsCustomizing(false)
    } catch {
      toast.error('Failed to save customization')
    }
  }

  const handlePreviewTemplate = (slug: string) => {
    if (!slug) return
    
    // Create sample data for preview
    const sampleEvent = {
      title: event?.title || 'Sample Event',
      description: event?.description || 'This is a sample event description',
      date: event?.date || new Date().toISOString(),
      venue: event?.venue || 'Sample Venue',
      googleMapLink: event?.googleMapLink,
      coverImage: event?.coverImage,
    }
    
    const sampleGuest = {
      name: 'John Doe',
      email: 'john@example.com',
      inviteToken: 'sample-token',
    }
    
    const sampleAssets = {
      images: customization.images,
      colors: customization.colors,
      fonts: customization.fonts,
    }

    const params = new URLSearchParams({
      event: JSON.stringify(sampleEvent),
      guest: JSON.stringify(sampleGuest),
      assets: JSON.stringify(sampleAssets),
    })

    window.open(`/templates/base/${slug}?${params.toString()}`, '_blank')
  }

  if (eventLoading || templatesLoading) {
    return (
      <Card className="border border-gray-200 shadow-none">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <Spinner className="h-8 w-8" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Template */}
      {currentTemplate && (
        <Card className="border border-gray-200 shadow-none">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-black">
              Current Template
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              {currentTemplate.previewImage && (
                <div className="relative h-20 w-20 rounded-lg overflow-hidden border border-gray-200">
                  <Image
                    src={currentTemplate.previewImage}
                    alt={currentTemplate.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-black">{currentTemplate.title}</h3>
                <p className="text-sm text-gray-600">{currentTemplate.name}</p>
                {currentTemplate.slug && (
                  <code className="text-xs text-gray-500 mt-1">{currentTemplate.slug}</code>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePreviewTemplate(currentTemplate.slug!)}
                  disabled={!currentTemplate.slug}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCustomizing(!isCustomizing)}
                >
                  <Palette className="h-4 w-4 mr-2" />
                  Customize
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customization Panel */}
      {isCustomizing && selectedTemplate && (
        <Card className="border border-gray-200 shadow-none">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-black">
              Customize Template
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Colors */}
            {selectedTemplate.assets?.colors && selectedTemplate.assets.colors.length > 0 && (
              <div>
                <Label className="text-sm font-semibold text-black mb-2 block">
                  <Palette className="h-4 w-4 inline mr-2" />
                  Colors
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {selectedTemplate.assets.colors.map((color, idx) => (
                    <div key={idx} className="space-y-1">
                      <Label className="text-xs text-gray-600">
                        {color.split('_').pop() || `Color ${idx + 1}`}
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={customization.colors[color] || color}
                          onChange={(e) =>
                            setCustomization(prev => ({
                              ...prev,
                              colors: { ...prev.colors, [color]: e.target.value },
                            }))
                          }
                          className="h-10 w-20"
                        />
                        <Input
                          type="text"
                          value={customization.colors[color] || color}
                          onChange={(e) =>
                            setCustomization(prev => ({
                              ...prev,
                              colors: { ...prev.colors, [color]: e.target.value },
                            }))
                          }
                          placeholder="#000000"
                          className="h-10 text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fonts */}
            {selectedTemplate.assets?.fonts && selectedTemplate.assets.fonts.length > 0 && (
              <div>
                <Label className="text-sm font-semibold text-black mb-2 block">
                  <Type className="h-4 w-4 inline mr-2" />
                  Fonts
                </Label>
                <div className="space-y-2">
                  {selectedTemplate.assets.fonts.map((font, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Label className="text-xs text-gray-600 w-24">
                        {font.split('_').pop() || `Font ${idx + 1}`}
                      </Label>
                      <Input
                        type="text"
                        value={customization.fonts[font] || font}
                        onChange={(e) =>
                          setCustomization(prev => ({
                            ...prev,
                            fonts: { ...prev.fonts, [font]: e.target.value },
                          }))
                        }
                        placeholder="Arial, sans-serif"
                        className="h-10 text-xs flex-1"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Images */}
            {selectedTemplate.assets?.images && selectedTemplate.assets.images.length > 0 && (
              <div>
                <Label className="text-sm font-semibold text-black mb-2 block">
                  <ImageIcon className="h-4 w-4 inline mr-2" />
                  Images
                </Label>
                <div className="space-y-2">
                  {selectedTemplate.assets.images.map((img, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Label className="text-xs text-gray-600 w-24">
                        {img.split('_').pop() || `Image ${idx + 1}`}
                      </Label>
                      <Input
                        type="url"
                        value={customization.images[img] || img}
                        onChange={(e) =>
                          setCustomization(prev => ({
                            ...prev,
                            images: { ...prev.images, [img]: e.target.value },
                          }))
                        }
                        placeholder="https://example.com/image.jpg"
                        className="h-10 text-xs flex-1"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setIsCustomizing(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveCustomization}
                disabled={updateEvent.isPending}
              >
                {updateEvent.isPending ? 'Saving...' : 'Save Customization'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Template Selection */}
      <Card className="border border-gray-200 shadow-none">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-black">
            Select Template
          </CardTitle>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <p className="text-sm text-gray-600 text-center py-8">
              No templates available
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedTemplateSlug === template.slug
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleSelectTemplate(template.slug!)}
                >
                  {template.previewImage && (
                    <div className="relative h-32 w-full rounded mb-3 overflow-hidden border border-gray-200">
                      <Image
                        src={template.previewImage}
                        alt={template.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-black text-sm">{template.title}</h3>
                      <p className="text-xs text-gray-600 mt-1">{template.name}</p>
                    </div>
                    {selectedTemplateSlug === template.slug && (
                      <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {template.isPremium && (
                      <Badge variant="default" className="text-xs">Premium</Badge>
                    )}
                    {template.slug && (
                      <code className="text-xs text-gray-500">{template.slug}</code>
                    )}
                  </div>
                  {template.variables && template.variables.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {template.variables.slice(0, 3).map((v, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {v}
                        </Badge>
                      ))}
                      {template.variables.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.variables.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
