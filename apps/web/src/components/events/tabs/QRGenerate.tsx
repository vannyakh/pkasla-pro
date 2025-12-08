'use client'

import React, { useMemo, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import html2canvas from 'html2canvas'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable'
import { useEvent } from '@/hooks/api/useEvent'
import { useGenerateEventQRToken } from '@/hooks/api/useEvent'
import { 
  Download, 
  Loader2, 
  QrCode as QrCodeIcon, 
  AlertCircle, 
  RefreshCw,
  Palette,
  Type,
  Upload,
  X,
  Image as ImageIcon
} from 'lucide-react'
import { env } from '@/config/env'
import toast from 'react-hot-toast'

interface QRGenerateProps {
  eventId: string
}

// QR Code frame styles
const FRAME_STYLES = {
  none: {
    name: 'No Frame',
    background: 'transparent',
    border: 'none',
    padding: '16px',
    shadow: undefined,
  },
  simple: {
    name: 'Simple Border',
    background: '#ffffff',
    border: '2px solid #e5e7eb',
    padding: '24px',
    shadow: undefined,
  },
  elegant: {
    name: 'Elegant Gold',
    background: 'linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)',
    border: '4px solid #d4af37',
    padding: '32px',
    shadow: undefined,
  },
  modern: {
    name: 'Modern Gradient',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    padding: '32px',
    shadow: undefined,
  },
  minimal: {
    name: 'Minimal Shadow',
    background: '#ffffff',
    border: 'none',
    padding: '32px',
    shadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
  },
}

type FrameStyleKey = keyof typeof FRAME_STYLES

interface QRCustomization {
  frameStyle: FrameStyleKey
  qrFgColor: string
  qrBgColor: string
  qrSize: number
  logoImage?: string
  titleText: string
  subtitleText: string
  showEventDetails: boolean
  customBorderColor?: string
}

export default function QRGenerate({ eventId }: QRGenerateProps) {
  const { data: event, isLoading, error, refetch } = useEvent(eventId)
  const generateQRTokenMutation = useGenerateEventQRToken()
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [customization, setCustomization] = useState<QRCustomization>({
    frameStyle: 'simple',
    qrFgColor: '#000000',
    qrBgColor: '#ffffff',
    qrSize: 280,
    titleText: 'Scan to Join',
    subtitleText: 'Join our event',
    showEventDetails: true,
  })

  // Get site URL for building QR code URL
  const siteUrl = useMemo(() => {
    if (typeof window !== 'undefined') {
      return process.env.NEXT_PUBLIC_SITE_URL || env.nextAuthUrl || window.location.origin
    }
    return process.env.NEXT_PUBLIC_SITE_URL || env.nextAuthUrl || 'https://example.com'
  }, [])

  // Generate QR code URL for event
  const getQRCodeUrl = (token: string) => {
    return `${siteUrl}/join/${token}`
  }

  // Generate QR code token if not exists
  const handleGenerateToken = async () => {
    try {
      await generateQRTokenMutation.mutateAsync(eventId)
      // Refetch event to get updated token
      await refetch()
      toast.success('QR code generated successfully!')
    } catch {
      // Error is handled by mutation
    }
  }

  // Handle logo upload
  const handleLogoUpload = async (file: File) => {
    try {
      setUploadingLogo(true)
      
      // Convert to base64
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setCustomization(prev => ({
          ...prev,
          logoImage: result,
        }))
        toast.success('Logo uploaded!')
        setUploadingLogo(false)
      }
      reader.onerror = () => {
        toast.error('Failed to read image')
        setUploadingLogo(false)
      }
      reader.readAsDataURL(file)
    } catch {
      toast.error('Failed to upload logo')
      setUploadingLogo(false)
    }
  }

  // Trigger logo upload
  const triggerLogoUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        handleLogoUpload(file)
      }
    }
    input.click()
  }

  // Download QR code with customizations as PNG using html2canvas
  const downloadQRCode = async () => {
    if (!event?.qrCodeToken) return

    const qrElement = document.getElementById('qr-preview-card')
    if (!qrElement) {
      toast.error('QR preview not found')
      return
    }

    try {
      // Clone the element to avoid modifying the original
      const clonedElement = qrElement.cloneNode(true) as HTMLElement
      clonedElement.style.position = 'absolute'
      clonedElement.style.left = '-9999px'
      clonedElement.style.top = '-9999px'
      document.body.appendChild(clonedElement)

      // Convert any modern color formats to compatible ones
      const allElements = clonedElement.querySelectorAll('*')
      allElements.forEach((el) => {
        const element = el as HTMLElement
        const computedStyle = window.getComputedStyle(element)
        
        // Convert color properties to RGB format
        const colorProps = ['color', 'backgroundColor', 'borderColor', 'fill', 'stroke']
        colorProps.forEach((prop) => {
          const value = computedStyle.getPropertyValue(prop)
          if (value && value.includes('lab(')) {
            // If lab() is detected, use a fallback
            element.style.setProperty(prop, 'inherit', 'important')
          }
        })
      })

      const canvas = await html2canvas(clonedElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false,
        allowTaint: true,
        foreignObjectRendering: false,
        imageTimeout: 0,
        onclone: (clonedDoc) => {
          // Additional cleanup in cloned document
          const clonedQR = clonedDoc.getElementById('qr-preview-card')
          if (clonedQR) {
            // Force all text colors to be explicit
            const textElements = clonedQR.querySelectorAll('h3, p, div')
            textElements.forEach((el) => {
              const element = el as HTMLElement
              const computedColor = window.getComputedStyle(element).color
              if (computedColor && !computedColor.includes('lab(')) {
                element.style.color = computedColor
              }
            })
          }
        },
      })

      // Clean up cloned element
      document.body.removeChild(clonedElement)

      canvas.toBlob((blob) => {
        if (blob) {
          const downloadUrl = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = downloadUrl
          link.download = `qr-code-${event.title.replace(/\s+/g, '-')}-${event.qrCodeToken?.slice(0, 8) || 'event'}.png`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(downloadUrl)
          toast.success('QR code downloaded successfully!')
        }
      }, 'image/png')
    } catch (error) {
      console.error('Failed to download QR code:', error)
      toast.error('Failed to download QR code. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <Card className="border border-gray-200 shadow-none">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-black">បង្កើតQR (Generate QR)</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border border-gray-200 shadow-none">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-black">បង្កើតQR (Generate QR)</CardTitle>
        </CardHeader>
        <CardContent className="py-8">
          <div className="text-center text-sm text-red-600">
            {error.message || 'Failed to load event'}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!event) {
    return (
      <Card className="border border-gray-200 shadow-none">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-black">បង្កើតQR (Generate QR)</CardTitle>
        </CardHeader>
        <CardContent className="py-8">
          <div className="text-center text-sm text-gray-600">
            Event not found
          </div>
        </CardContent>
      </Card>
    )
  }

  // If no QR token, show generate button
  if (!event.qrCodeToken) {
    return (
      <Card className="border border-gray-200 shadow-none">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-black">បង្កើតQR (Generate QR)</CardTitle>
        </CardHeader>
        <CardContent className="py-8">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-gray-400" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900">No QR code generated yet</p>
              <p className="text-sm text-gray-600">
                Generate a QR code for guests to scan and join this event
              </p>
            </div>
            <Button
              onClick={handleGenerateToken}
              disabled={generateQRTokenMutation.isPending}
              className="gap-2"
            >
              {generateQRTokenMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <QrCodeIcon className="h-4 w-4" />
                  Generate QR Code
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const qrCodeUrl = getQRCodeUrl(event.qrCodeToken)
  const selectedFrame = FRAME_STYLES[customization.frameStyle]

  // Render customized QR preview
  const renderQRPreview = () => {
    // Determine text colors based on frame style (using explicit hex/rgb values)
    const getTitleColor = () => {
      if (customization.frameStyle === 'modern') return '#ffffff'
      return '#1f2937'
    }

    const getTextColor = () => {
      if (customization.frameStyle === 'modern') return '#e5e7eb'
      return '#6b7280'
    }

    const getSubtleTextColor = () => {
      if (customization.frameStyle === 'modern') return '#d1d5db'
      return '#9ca3af'
    }

    return (
      <div
        id="qr-preview-card"
        className="flex flex-col items-center justify-center rounded-lg"
        style={{
          background: selectedFrame.background,
          border: customization.customBorderColor 
            ? `4px solid ${customization.customBorderColor}` 
            : selectedFrame.border,
          padding: selectedFrame.padding,
          boxShadow: selectedFrame.shadow,
          minHeight: '400px',
        }}
      >
        {/* Logo */}
        {customization.logoImage && (
          <div className="mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={customization.logoImage}
              alt="Logo"
              className="h-16 w-auto object-contain"
              style={{ maxWidth: '200px' }}
            />
          </div>
        )}

        {/* Title */}
        <h3 
          className="text-xl font-bold mb-2 text-center" 
          style={{
            color: getTitleColor(),
            fontFamily: 'inherit',
          }}
        >
          {customization.titleText}
        </h3>

        {/* Event details */}
        {customization.showEventDetails && event && (
          <p 
            className="text-sm mb-4 text-center" 
            style={{
              color: getTextColor(),
            }}
          >
            {event.title}
          </p>
        )}

        {/* QR Code */}
        <div 
          className="mb-4" 
          style={{
            backgroundColor: '#ffffff',
            padding: '16px',
            borderRadius: '8px',
          }}
        >
          <QRCodeSVG
            id="event-qr-code"
            value={qrCodeUrl}
            size={customization.qrSize}
            level="H"
            includeMargin={true}
            fgColor={customization.qrFgColor}
            bgColor={customization.qrBgColor}
          />
        </div>

        {/* Subtitle */}
        <p 
          className="text-sm text-center" 
          style={{
            color: getTextColor(),
          }}
        >
          {customization.subtitleText}
        </p>

        {/* Event date and venue */}
        {customization.showEventDetails && event && (
          <div 
            className="mt-3 text-xs text-center space-y-1" 
            style={{
              color: getSubtleTextColor(),
            }}
          >
            {event.date && (
              <p>
                {new Date(event.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            )}
            {event.venue && <p>{event.venue}</p>}
          </div>
        )}
      </div>
    )
  }

  return (
    <Card className="border border-gray-200 shadow-none">
      <CardHeader>
        <div className="flex items-center justify-between">
        <CardTitle className="text-lg font-semibold text-black">បង្កើតQR (Generate QR)</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={downloadQRCode}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateToken}
            disabled={generateQRTokenMutation.isPending}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${generateQRTokenMutation.isPending ? 'animate-spin' : ''}`} />
            Regenerate
          </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResizablePanelGroup direction="horizontal" className="min-h-[600px] rounded-lg border">
          {/* Customization Panel */}
          <ResizablePanel defaultSize={40} minSize={30}>
            <div className="h-full overflow-y-auto p-6 space-y-6">
              <div className="space-y-4">
                <h3 className="text-base font-semibold flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Customize QR Code
                </h3>

                {/* Frame Style Selection */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Frame Style</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(FRAME_STYLES).map(([key, style]) => (
                      <button
                        key={key}
                        onClick={() =>
                          setCustomization({ ...customization, frameStyle: key as FrameStyleKey })
                        }
                        className={`p-3 rounded-lg border-2 transition-all text-left ${
                          customization.frameStyle === key
                            ? 'border-rose-500 bg-rose-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div
                          className="h-12 rounded mb-2"
                          style={{ background: style.background }}
                        />
                        <p className="text-xs font-medium">{style.name}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* QR Colors */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Palette className="h-3.5 w-3.5" />
                    QR Code Colors
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="qrFg" className="text-xs">Foreground</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="qrFg"
                          type="color"
                          value={customization.qrFgColor}
                          onChange={(e) =>
                            setCustomization({ ...customization, qrFgColor: e.target.value })
                          }
                          className="w-16 h-9"
                        />
                        <Input
                          type="text"
                          value={customization.qrFgColor}
                          onChange={(e) =>
                            setCustomization({ ...customization, qrFgColor: e.target.value })
                          }
                          className="flex-1 h-9 text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="qrBg" className="text-xs">Background</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="qrBg"
                          type="color"
                          value={customization.qrBgColor}
                          onChange={(e) =>
                            setCustomization({ ...customization, qrBgColor: e.target.value })
                          }
                          className="w-16 h-9"
                        />
                        <Input
                          type="text"
                          value={customization.qrBgColor}
                          onChange={(e) =>
                            setCustomization({ ...customization, qrBgColor: e.target.value })
                          }
                          className="flex-1 h-9 text-xs"
                        />
                      </div>
                    </div>
                  </div>
          </div>

                {/* QR Size */}
                <div className="space-y-2">
                  <Label htmlFor="qrSize" className="text-sm font-medium">
                    QR Code Size: {customization.qrSize}px
                  </Label>
                  <Input
                    id="qrSize"
                    type="range"
                    min="200"
                    max="400"
                    step="20"
                    value={customization.qrSize}
                    onChange={(e) =>
                      setCustomization({ ...customization, qrSize: parseInt(e.target.value) })
                    }
              />
            </div>

                {/* Logo Upload */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <ImageIcon className="h-3.5 w-3.5" />
                    Logo/Branding
                  </Label>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <ImageIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">
                          {customization.logoImage ? 'Logo uploaded' : 'No logo'}
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {customization.logoImage && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setCustomization({ ...customization, logoImage: undefined })
                          }
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={triggerLogoUpload}
                        disabled={uploadingLogo}
                      >
                        {uploadingLogo ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Text Customization */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Type className="h-3.5 w-3.5" />
                    Custom Text
                  </Label>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="titleText" className="text-xs">Title</Label>
                      <Input
                        id="titleText"
                        value={customization.titleText}
                        onChange={(e) =>
                          setCustomization({ ...customization, titleText: e.target.value })
                        }
                        placeholder="Scan to Join"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subtitleText" className="text-xs">Subtitle</Label>
                      <Input
                        id="subtitleText"
                        value={customization.subtitleText}
                        onChange={(e) =>
                          setCustomization({ ...customization, subtitleText: e.target.value })
                        }
                        placeholder="Join our event"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="showDetails"
                        checked={customization.showEventDetails}
                        onChange={(e) =>
                          setCustomization({
                            ...customization,
                            showEventDetails: e.target.checked,
                          })
                        }
                        className="rounded"
                      />
                      <Label htmlFor="showDetails" className="text-xs cursor-pointer">
                        Show event details
                      </Label>
                    </div>
                </div>
              </div>

                {/* Custom Border Color */}
                <div className="space-y-2">
                  <Label htmlFor="customBorder" className="text-sm font-medium">
                    Custom Border Color (optional)
                  </Label>
              <div className="flex gap-2">
                    <Input
                      id="customBorder"
                      type="color"
                      value={customization.customBorderColor || '#e5e7eb'}
                      onChange={(e) =>
                        setCustomization({ ...customization, customBorderColor: e.target.value })
                      }
                      className="w-20 h-9"
                    />
                    {customization.customBorderColor && (
                <Button
                  variant="outline"
                  size="sm"
                        onClick={() =>
                          setCustomization({ ...customization, customBorderColor: undefined })
                        }
                >
                        Reset
                </Button>
                    )}
                  </div>
                </div>

                {/* URL Info */}
                <div className="pt-4 border-t">
                  <Label className="text-xs text-gray-500 mb-2 block">Join URL:</Label>
                  <div className="text-xs text-gray-700 break-all bg-gray-50 p-2 rounded border mb-2">
                    {qrCodeUrl}
                  </div>
                <Button
                  variant="outline"
                  size="sm"
                    className="w-full"
                  onClick={() => {
                    navigator.clipboard.writeText(qrCodeUrl)
                    toast.success('Join URL copied to clipboard!')
                  }}
                >
                  Copy URL
                </Button>
              </div>
            </div>
          </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Preview Panel */}
          <ResizablePanel defaultSize={60}>
            <div className="h-full overflow-y-auto p-6 bg-gray-50">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold">Live Preview</h3>
                  <p className="text-xs text-gray-500">Drag the handle to resize</p>
                </div>
                <div className="flex items-center justify-center min-h-[500px]">
                  {renderQRPreview()}
                </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-xs text-blue-800">
                    <strong>How it works:</strong> When guests scan this QR code, they will be taken
                    to a page where they can enter their name and contact information to join your
                    event. They will automatically be added as a confirmed guest.
            </p>
          </div>
        </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </CardContent>
    </Card>
  )
}
