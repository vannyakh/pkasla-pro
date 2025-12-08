'use client'

import React, { useState, useMemo } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import html2canvas from 'html2canvas'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Download, 
  Mail, 
  Copy, 
  Settings, 
  Image as ImageIcon, 
  Type,
  Palette,
  Upload,
  X,
  Loader2
} from 'lucide-react'
import type { Guest } from '@/types/guest'
import type { Event } from '@/types/event'
import { env } from '@/config/env'
import toast from 'react-hot-toast'

interface InviteCardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  guests: Guest[]
  event: Event | undefined
}

// Luxury card templates
const CARD_TEMPLATES = {
  elegant: {
    name: 'Elegant Gold',
    background: 'linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%)',
    accentColor: '#d4af37',
    textColor: '#333333',
    fontFamily: 'serif',
  },
  modern: {
    name: 'Modern Minimal',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    accentColor: '#ffffff',
    textColor: '#ffffff',
    fontFamily: 'sans-serif',
  },
  romantic: {
    name: 'Romantic Rose',
    background: 'linear-gradient(135deg, #ffeef8 0%, #ffe0f0 100%)',
    accentColor: '#e91e63',
    textColor: '#4a4a4a',
    fontFamily: 'cursive',
  },
  luxury: {
    name: 'Luxury Black',
    background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
    accentColor: '#ffd700',
    textColor: '#ffffff',
    fontFamily: 'serif',
  },
  botanical: {
    name: 'Botanical Green',
    background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
    accentColor: '#2e7d32',
    textColor: '#1b5e20',
    fontFamily: 'sans-serif',
  },
}

type TemplateKey = keyof typeof CARD_TEMPLATES

interface CardCustomization {
  template: TemplateKey
  backgroundImage?: string
  profileImage?: string
  logoImage?: string
  greetingText: string
  messageText: string
  footerText: string
  customColor?: string
  customFont?: string
}

export default function InviteCardDialog({
  open,
  onOpenChange,
  guests,
  event,
}: InviteCardDialogProps) {
  const [selectedGuestIds, setSelectedGuestIds] = useState<Set<string>>(new Set())
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState<'guests' | 'design'>('guests')
  const [customization, setCustomization] = useState<CardCustomization>({
    template: 'elegant',
    greetingText: 'You Are Cordially Invited',
    messageText: 'Join us for a celebration',
    footerText: 'We look forward to your presence',
  })
  const [uploadingImage, setUploadingImage] = useState<'background' | 'profile' | 'logo' | null>(null)

  // Get site URL for building invite links
  const siteUrl = useMemo(() => {
    if (typeof window !== 'undefined') {
      return process.env.NEXT_PUBLIC_SITE_URL || env.nextAuthUrl || window.location.origin
    }
    return process.env.NEXT_PUBLIC_SITE_URL || env.nextAuthUrl || 'https://example.com'
  }, [])

  // Filter guests that have invite tokens
  const guestsWithTokens = useMemo(() => {
    return guests.filter((guest) => guest.inviteToken)
  }, [guests])

  // Generate invite URL for a guest
  const getInviteUrl = (token: string) => {
    return `${siteUrl}/invite/${token}`
  }

  // Toggle guest selection
  const toggleGuest = (guestId: string) => {
    setSelectedGuestIds((prev) => {
      const next = new Set(prev)
      if (next.has(guestId)) {
        next.delete(guestId)
      } else {
        next.add(guestId)
      }
      return next
    })
  }

  // Select all guests
  const selectAll = () => {
    setSelectedGuestIds(new Set(guestsWithTokens.map((g) => g.id)))
  }

  // Deselect all guests
  const deselectAll = () => {
    setSelectedGuestIds(new Set())
  }

  // Handle image upload
  const handleImageUpload = async (type: 'background' | 'profile' | 'logo', file: File) => {
    try {
      setUploadingImage(type)
      
      // Convert to base64
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setCustomization(prev => ({
          ...prev,
          [`${type}Image`]: result,
        }))
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} image uploaded!`)
        setUploadingImage(null)
      }
      reader.onerror = () => {
        toast.error('Failed to read image')
        setUploadingImage(null)
      }
      reader.readAsDataURL(file)
    } catch {
      toast.error('Failed to upload image')
      setUploadingImage(null)
    }
  }

  // Trigger file input
  const triggerImageUpload = (type: 'background' | 'profile' | 'logo') => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        handleImageUpload(type, file)
      }
    }
    input.click()
  }

  // Download invitation card as image using html2canvas
  const downloadCard = async (guest: Guest) => {
    try {
      setIsGenerating(true)
      const cardElement = document.getElementById(`invite-card-${guest.id}`)
      if (!cardElement) {
        toast.error('Card element not found')
        return
      }

      // Use html2canvas to convert the card to an image
      const canvas = await html2canvas(cardElement, {
        scale: 2, // Higher quality
        useCORS: true, // Allow cross-origin images
        backgroundColor: null,
        logging: false,
      })

      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `invite-card-${guest.name.replace(/\s+/g, '-')}-${guest.inviteToken?.slice(0, 8) || 'invitation'}.png`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
          toast.success('Card downloaded successfully!')
        }
        }, 'image/png')
    } catch (error) {
      console.error('Error downloading card:', error)
      toast.error('Failed to download card')
    } finally {
      setIsGenerating(false)
    }
  }

  // Copy invite link to clipboard
  const copyInviteLink = async (guest: Guest) => {
    if (!guest.inviteToken) {
      toast.error('No invite token available')
      return
    }
    const inviteUrl = getInviteUrl(guest.inviteToken)
    try {
      await navigator.clipboard.writeText(inviteUrl)
      toast.success('Invite link copied to clipboard!')
    } catch {
      toast.error('Failed to copy link')
    }
  }

  // Share via email
  const shareViaEmail = (guest: Guest) => {
    if (!guest.email) {
      toast.error('Guest email not available')
      return
    }
    if (!guest.inviteToken) {
      toast.error('No invite token available')
      return
    }
    const inviteUrl = getInviteUrl(guest.inviteToken)
    const subject = encodeURIComponent(`Invitation to ${event?.title || 'Event'}`)
    const body = encodeURIComponent(
      `Dear ${guest.name},\n\nYou are invited to ${event?.title || 'our event'}.\n\nView your invitation: ${inviteUrl}`
    )
    window.location.href = `mailto:${guest.email}?subject=${subject}&body=${body}`
  }

  // Download all selected cards
  const downloadAll = async () => {
    if (selectedGuestIds.size === 0) {
      toast.error('Please select at least one guest')
      return
    }

    const selectedGuests = guestsWithTokens.filter((g) => selectedGuestIds.has(g.id))
    for (const guest of selectedGuests) {
      await downloadCard(guest)
      // Small delay between downloads
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
    toast.success(`Downloaded ${selectedGuests.length} card(s)`)
  }

  const selectedTemplate = CARD_TEMPLATES[customization.template]

  // Render luxury invitation card
  const renderCard = (guest: Guest) => {
    const inviteUrl = getInviteUrl(guest.inviteToken!)

    return (
      <div
        id={`invite-card-${guest.id}`}
        className="relative w-full rounded-lg overflow-hidden shadow-lg"
        style={{
          minHeight: '600px',
          background: customization.backgroundImage
            ? `url(${customization.backgroundImage})`
            : customization.customColor || selectedTemplate.background,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          fontFamily: customization.customFont || selectedTemplate.fontFamily,
        }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/10" />

        {/* Card content */}
        <div className="relative p-8 flex flex-col items-center justify-between min-h-[600px]">
          {/* Header with logo */}
          <div className="text-center space-y-4 w-full">
            {customization.logoImage && (
              <div className="flex justify-center mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={customization.logoImage}
                  alt="Logo"
                  className="h-16 w-auto object-contain"
                />
              </div>
            )}

            {/* Greeting */}
            <div
              className="text-2xl font-bold mb-2"
              style={{
                color: customization.customColor
                  ? selectedTemplate.textColor
                  : selectedTemplate.accentColor,
              }}
            >
              {customization.greetingText}
            </div>

            {/* Event Title */}
            <h1
              className="text-4xl font-bold mb-4"
              style={{ color: selectedTemplate.textColor }}
            >
              {event?.title || 'Event Invitation'}
            </h1>

            {/* Profile Image */}
            {customization.profileImage && (
              <div className="flex justify-center my-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={customization.profileImage}
                  alt="Profile"
                  className="h-32 w-32 rounded-full object-cover border-4"
                  style={{ borderColor: selectedTemplate.accentColor }}
                />
              </div>
            )}

            {/* Guest Name */}
            <p className="text-2xl" style={{ color: selectedTemplate.textColor }}>
              Dear <span className="font-semibold">{guest.name}</span>
            </p>
          </div>

          {/* Main content */}
          <div className="text-center space-y-6 w-full">
            {/* Custom Message */}
            {customization.messageText && (
              <p
                className="text-lg italic max-w-md mx-auto"
                style={{ color: selectedTemplate.textColor }}
              >
                {customization.messageText}
              </p>
            )}

            {/* Event Details */}
            <div className="space-y-2">
              {event?.date && (
                <p className="text-lg font-semibold" style={{ color: selectedTemplate.textColor }}>
                  {new Date(event.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              )}
              {event?.venue && (
                <p className="text-base" style={{ color: selectedTemplate.textColor }}>
                  {event.venue}
                </p>
              )}
            </div>

            {/* QR Code */}
            <div className="flex justify-center py-4">
              <div className="bg-white p-4 rounded-lg shadow-md">
                <QRCodeSVG
                  id={`qr-card-${guest.inviteToken}`}
                  value={inviteUrl}
                  size={160}
                  level="H"
                  includeMargin={true}
                  fgColor="#000000"
                  bgColor="#ffffff"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center space-y-2 w-full">
            <p className="text-sm" style={{ color: selectedTemplate.textColor }}>
              Scan QR code to RSVP
            </p>
            {customization.footerText && (
              <p
                className="text-base italic"
                style={{ color: selectedTemplate.accentColor }}
              >
                {customization.footerText}
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Luxury Invitation Cards</DialogTitle>
          <DialogDescription>
            Design beautiful invitation cards with custom templates, images, and personalized messages
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'guests' | 'design')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="design" className="gap-2">
              <Palette className="h-4 w-4" />
              Card Design
            </TabsTrigger>
            <TabsTrigger value="guests" className="gap-2">
              <Mail className="h-4 w-4" />
              Select Guests ({selectedGuestIds.size})
            </TabsTrigger>
          </TabsList>

          {/* Design Tab */}
          <TabsContent value="design" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Design Controls */}
              <div className="space-y-6">
                {/* Template Selection */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Choose Template</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(CARD_TEMPLATES).map(([key, template]) => (
                      <button
                        key={key}
                        onClick={() =>
                          setCustomization({ ...customization, template: key as TemplateKey })
                        }
                        className={`p-4 rounded-lg border-2 transition-all ${
                          customization.template === key
                            ? 'border-rose-500 bg-rose-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div
                          className="h-16 rounded mb-2"
                          style={{ background: template.background }}
                        />
                        <p className="text-sm font-medium">{template.name}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image Uploads */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Images
                  </Label>
                  <div className="space-y-2">
                    {/* Background Image */}
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <ImageIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium">Background Image</p>
                          <p className="text-xs text-gray-500">
                            {customization.backgroundImage ? 'Image uploaded' : 'No image'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {customization.backgroundImage && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setCustomization({ ...customization, backgroundImage: undefined })
                            }
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => triggerImageUpload('background')}
                          disabled={uploadingImage === 'background'}
                        >
                          {uploadingImage === 'background' ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Profile Image */}
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <ImageIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium">Profile/Couple Photo</p>
                          <p className="text-xs text-gray-500">
                            {customization.profileImage ? 'Image uploaded' : 'No image'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {customization.profileImage && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setCustomization({ ...customization, profileImage: undefined })
                            }
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => triggerImageUpload('profile')}
                          disabled={uploadingImage === 'profile'}
                        >
                          {uploadingImage === 'profile' ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Logo Image */}
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <ImageIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium">Logo/Monogram</p>
                          <p className="text-xs text-gray-500">
                            {customization.logoImage ? 'Image uploaded' : 'No image'}
                          </p>
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
                          onClick={() => triggerImageUpload('logo')}
                          disabled={uploadingImage === 'logo'}
                        >
                          {uploadingImage === 'logo' ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Text Customization */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <Type className="h-4 w-4" />
                    Custom Text
                  </Label>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="greeting">Greeting Text</Label>
                      <Input
                        id="greeting"
                        value={customization.greetingText}
                        onChange={(e) =>
                          setCustomization({ ...customization, greetingText: e.target.value })
                        }
                        placeholder="You Are Cordially Invited"
                      />
                    </div>
                    <div>
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        value={customization.messageText}
                        onChange={(e) =>
                          setCustomization({ ...customization, messageText: e.target.value })
                        }
                        placeholder="Join us for a celebration"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="footer">Footer Text</Label>
                      <Input
                        id="footer"
                        value={customization.footerText}
                        onChange={(e) =>
                          setCustomization({ ...customization, footerText: e.target.value })
                        }
                        placeholder="We look forward to your presence"
                      />
                    </div>
                  </div>
                </div>

                {/* Advanced Options */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Advanced
                  </Label>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="customColor">Custom Background Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="customColor"
                          type="color"
                          value={customization.customColor || selectedTemplate.accentColor}
                          onChange={(e) =>
                            setCustomization({ ...customization, customColor: e.target.value })
                          }
                          className="w-20 h-10"
                        />
                        {customization.customColor && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setCustomization({ ...customization, customColor: undefined })
                            }
                          >
                            Reset
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Preview */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Preview</Label>
                {guestsWithTokens.length > 0 ? (
                  <div className="border-2 border-dashed rounded-lg p-4">
                    {renderCard(guestsWithTokens[0])}
                  </div>
                ) : (
                  <div className="border-2 border-dashed rounded-lg p-8 text-center text-gray-500">
                    <p>No guests with tokens available for preview</p>
                    <p className="text-sm mt-2">Add guests to see the card preview</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Guests Tab */}
          <TabsContent value="guests" className="space-y-4 mt-6">
          {/* Selection controls */}
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={selectAll}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAll}>
                Deselect All
              </Button>
              <span className="text-sm text-gray-600">
                {selectedGuestIds.size} of {guestsWithTokens.length} selected
              </span>
            </div>
            {selectedGuestIds.size > 0 && (
              <Button onClick={downloadAll} disabled={isGenerating}>
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                <Download className="h-4 w-4 mr-2" />
                  )}
                Download All Selected
              </Button>
            )}
          </div>

          {/* Guest list with preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {guestsWithTokens.length === 0 ? (
              <div className="col-span-2 text-center py-8 text-gray-500">
                  No guests with invitation tokens found. Please generate invite tokens for your
                  guests first.
              </div>
            ) : (
              guestsWithTokens.map((guest) => {
                const isSelected = selectedGuestIds.has(guest.id)

                return (
                  <div
                    key={guest.id}
                    className={`border rounded-lg p-4 space-y-3 ${
                      isSelected ? 'border-rose-500 bg-rose-50' : 'border-gray-200'
                    }`}
                  >
                    {/* Guest selection */}
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={`guest-${guest.id}`}
                        checked={isSelected}
                        onCheckedChange={() => toggleGuest(guest.id)}
                      />
                      <Label htmlFor={`guest-${guest.id}`} className="flex-1 cursor-pointer">
                        <div>
                          <div className="font-semibold text-sm">{guest.name}</div>
                          {guest.email && (
                            <div className="text-xs text-gray-500">{guest.email}</div>
                          )}
                        </div>
                      </Label>
                    </div>

                    {/* Card preview */}
                      <div className="max-w-sm mx-auto">{renderCard(guest)}</div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => downloadCard(guest)}
                        disabled={isGenerating}
                      >
                          {isGenerating ? (
                            <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                          ) : (
                        <Download className="h-3.5 w-3.5 mr-2" />
                          )}
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyInviteLink(guest)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      {guest.email && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => shareViaEmail(guest)}
                        >
                          <Mail className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

