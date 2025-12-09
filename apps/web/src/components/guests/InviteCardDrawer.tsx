'use client'

import React, { useState, useMemo } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import html2canvas from 'html2canvas'
import { X, Download, Copy, Mail, Image as ImageIcon, Type, Upload, Loader2, Palette, Eye, QrCode, RotateCcw, Settings2, AlignLeft, AlignCenter, AlignRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import type { Guest } from '@/types/guest'
import type { Event } from '@/types/event'
import { env } from '@/config/env'
import toast from 'react-hot-toast'
import { CARD_TEMPLATES, type TemplateKey } from '@/constants/inviteCardTemplates'

interface InviteCardDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  guest?: Guest
  event?: Event
}

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
  // QR Code customization
  qrForegroundColor: string
  qrBackgroundColor: string
  qrSize: number
  qrErrorLevel: 'L' | 'M' | 'Q' | 'H'
  // Text styling
  greetingFontSize: number
  titleFontSize: number
  messageFontSize: number
  customTextColor?: string
  customAccentColor?: string
  // Layout
  cardPadding: number
  textAlign: 'left' | 'center' | 'right'
  // Image settings
  profileImageSize: number
  logoImageSize: number
  backgroundOpacity: number
  backgroundBlur: number
  profileBlur: number
}

function InviteCardDrawer({ open, onOpenChange, guest, event }: InviteCardDrawerProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [uploadingImage, setUploadingImage] = useState<'background' | 'profile' | 'logo' | null>(null)
  const [activeTab, setActiveTab] = useState<'customize' | 'preview'>('customize')
  const [openSections, setOpenSections] = useState<string[]>(['template'])
  const defaultCustomization: CardCustomization = {
    template: 'elegant',
    greetingText: 'You Are Cordially Invited',
    messageText: 'Join us for a celebration',
    footerText: 'We look forward to your presence',
    qrForegroundColor: '#000000',
    qrBackgroundColor: '#ffffff',
    qrSize: 160,
    qrErrorLevel: 'H',
    greetingFontSize: 24,
    titleFontSize: 36,
    messageFontSize: 18,
    cardPadding: 32,
    textAlign: 'center',
    profileImageSize: 128,
    logoImageSize: 64,
    backgroundOpacity: 10,
    backgroundBlur: 0,
    profileBlur: 0,
  }

  const [customization, setCustomization] = useState<CardCustomization>(defaultCustomization)

  // Reset to defaults
  const resetCustomization = () => {
    setCustomization(defaultCustomization)
    toast.success('Customization reset to defaults')
  }

  // Get site URL for building invite links
  const siteUrl = useMemo(() => {
    if (typeof window !== 'undefined') {
      return process.env.NEXT_PUBLIC_SITE_URL || env.nextAuthUrl || window.location.origin
    }
    return process.env.NEXT_PUBLIC_SITE_URL || env.nextAuthUrl || 'https://example.com'
  }, [])

  // Generate invite URL for the guest
  const getInviteUrl = (token: string) => {
    return `${siteUrl}/invite/${token}`
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
  const downloadCard = async () => {
    if (!guest) return
    
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
  const copyInviteLink = async () => {
    if (!guest?.inviteToken) {
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
  const shareViaEmail = () => {
    if (!guest?.email) {
      toast.error('Guest email not available')
      return
    }
    if (!guest?.inviteToken) {
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

  const selectedTemplate = CARD_TEMPLATES[customization.template]

  // Render luxury invitation card
  const renderCard = () => {
    if (!guest?.inviteToken) {
      return (
        <div className="text-center py-8 text-gray-500">
          <p>No invite token available for this guest</p>
          <p className="text-sm mt-2">Please generate an invite token first</p>
        </div>
      )
    }

    const inviteUrl = getInviteUrl(guest.inviteToken)

    return (
      <div
        id={`invite-card-${guest.id}`}
        className="relative w-full rounded-lg overflow-hidden shadow-lg"
        style={{
          minHeight: '600px',
          fontFamily: customization.customFont || selectedTemplate.fontFamily,
        }}
      >
        {/* Background layer */}
        <div
          className="absolute inset-0"
          style={{
            background: customization.backgroundImage
              ? `url(${customization.backgroundImage})`
              : customization.customColor || selectedTemplate.background,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: customization.backgroundImage && customization.backgroundBlur > 0 
              ? `blur(${customization.backgroundBlur}px)` 
              : 'none',
            transform: customization.backgroundImage && customization.backgroundBlur > 0 
              ? 'scale(1.05)' 
              : 'none',
          }}
        />
        {/* Overlay for better text readability */}
        <div 
          className="absolute inset-0" 
          style={{ backgroundColor: `rgba(0, 0, 0, ${customization.backgroundOpacity / 100})` }}
        />

        {/* Card content */}
        <div 
          className="relative flex flex-col items-center justify-between min-h-[600px]"
          style={{ 
            padding: `${customization.cardPadding}px`,
            textAlign: customization.textAlign,
          }}
        >
          {/* Header with logo */}
          <div 
            className="space-y-4 w-full"
            style={{ textAlign: customization.textAlign }}
          >
            {customization.logoImage && (
              <div className={`flex mb-4 ${customization.textAlign === 'center' ? 'justify-center' : customization.textAlign === 'right' ? 'justify-end' : 'justify-start'}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={customization.logoImage}
                  alt="Logo"
                  className="w-auto object-contain"
                  style={{ height: `${customization.logoImageSize}px` }}
                />
              </div>
            )}

            {/* Greeting */}
            <div
              className="font-bold mb-2"
              style={{
                fontSize: `${customization.greetingFontSize}px`,
                color: customization.customAccentColor || 
                  (customization.customColor ? selectedTemplate.textColor : selectedTemplate.accentColor),
              }}
            >
              {customization.greetingText}
            </div>

            {/* Event Title */}
            <h1
              className="font-bold mb-4"
              style={{ 
                fontSize: `${customization.titleFontSize}px`,
                color: customization.customTextColor || selectedTemplate.textColor 
              }}
            >
              {event?.title || 'Event Invitation'}
            </h1>

            {/* Profile Image */}
            {customization.profileImage && (
              <div className={`flex my-4 ${customization.textAlign === 'center' ? 'justify-center' : customization.textAlign === 'right' ? 'justify-end' : 'justify-start'}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={customization.profileImage}
                  alt="Profile"
                  className="rounded-full object-cover border-4"
                  style={{ 
                    height: `${customization.profileImageSize}px`,
                    width: `${customization.profileImageSize}px`,
                    borderColor: customization.customAccentColor || selectedTemplate.accentColor,
                    filter: customization.profileBlur > 0 ? `blur(${customization.profileBlur}px)` : 'none',
                  }}
                />
              </div>
            )}

            {/* Guest Name */}
            <p 
              style={{ 
                fontSize: `${customization.greetingFontSize}px`,
                color: customization.customTextColor || selectedTemplate.textColor 
              }}
            >
              Dear <span className="font-semibold">{guest.name}</span>
            </p>
          </div>

          {/* Main content */}
          <div className="space-y-6 w-full" style={{ textAlign: customization.textAlign }}>
            {/* Custom Message */}
            {customization.messageText && (
              <p
                className="italic max-w-md mx-auto"
                style={{ 
                  fontSize: `${customization.messageFontSize}px`,
                  color: customization.customTextColor || selectedTemplate.textColor,
                  marginLeft: customization.textAlign === 'left' ? '0' : 'auto',
                  marginRight: customization.textAlign === 'right' ? '0' : 'auto',
                }}
              >
                {customization.messageText}
              </p>
            )}

            {/* Event Details */}
            <div className="space-y-2">
              {event?.date && (
                <p 
                  className="font-semibold" 
                  style={{ 
                    fontSize: `${customization.messageFontSize}px`,
                    color: customization.customTextColor || selectedTemplate.textColor 
                  }}
                >
                  {new Date(event.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              )}
              {event?.venue && (
                <p 
                  style={{ 
                    fontSize: `${customization.messageFontSize - 2}px`,
                    color: customization.customTextColor || selectedTemplate.textColor 
                  }}
                >
                  {event.venue}
                </p>
              )}
            </div>

            {/* QR Code */}
            <div className={`flex py-4 ${customization.textAlign === 'center' ? 'justify-center' : customization.textAlign === 'right' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className="p-4 rounded-lg shadow-md"
                style={{ backgroundColor: customization.qrBackgroundColor }}
              >
                <QRCodeSVG
                  id={`qr-card-${guest.inviteToken}`}
                  value={inviteUrl}
                  size={customization.qrSize}
                  level={customization.qrErrorLevel}
                  includeMargin={true}
                  fgColor={customization.qrForegroundColor}
                  bgColor={customization.qrBackgroundColor}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="space-y-2 w-full" style={{ textAlign: customization.textAlign }}>
            <p 
              style={{ 
                fontSize: '14px',
                color: customization.customTextColor || selectedTemplate.textColor 
              }}
            >
              Scan QR code to RSVP
            </p>
            {customization.footerText && (
              <p
                className="italic"
                style={{ 
                  fontSize: `${customization.messageFontSize}px`,
                  color: customization.customAccentColor || selectedTemplate.accentColor 
                }}
              >
                {customization.footerText}
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (!guest) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Invitation Card</SheetTitle>
            <SheetDescription>No guest selected</SheetDescription>
          </SheetHeader>
          <div className="p-4 text-center text-gray-500">
            <p>Please select a guest to generate an invitation card</p>
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle>Invitation Card</SheetTitle>
              <SheetDescription>
                Generate and customize invitation card for {guest.name}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="p-4 sm:p-6 space-y-4">
          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={downloadCard}
              disabled={isGenerating || !guest.inviteToken}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download Card
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={copyInviteLink}
              disabled={!guest.inviteToken}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
            {guest.email && (
              <Button
                variant="outline"
                onClick={shareViaEmail}
                disabled={!guest.inviteToken}
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
            )}
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'customize' | 'preview')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="customize" className="gap-2">
                <Palette className="h-4 w-4" />
                Customize
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </TabsTrigger>
            </TabsList>

            {/* Customize Tab */}
            <TabsContent value="customize" className="space-y-3 mt-4">
              <Accordion type="multiple" value={openSections} onValueChange={setOpenSections} className="space-y-2">
                {/* Template Selection */}
                <AccordionItem value="template" className="border rounded-lg">
                  <AccordionTrigger className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      <Label className="text-sm font-medium">Template</Label>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pb-3">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {Object.entries(CARD_TEMPLATES).map(([key, template]) => (
                        <button
                          key={key}
                          onClick={() =>
                            setCustomization({ ...customization, template: key as TemplateKey })
                          }
                          className={`group relative p-3 rounded-lg border-2 transition-all hover:shadow-md ${
                            customization.template === key
                              ? 'border-rose-500 bg-rose-50 shadow-sm'
                              : 'border-gray-200 hover:border-gray-400 bg-white'
                          }`}
                          title={template.description}
                        >
                          <div
                            className="h-16 rounded mb-2 shadow-sm overflow-hidden"
                            style={{ background: template.background }}
                          >
                            <div className="h-full w-full flex items-center justify-center">
                              <div 
                                className="w-8 h-8 rounded-full border-2"
                                style={{ 
                                  borderColor: template.accentColor,
                                  backgroundColor: template.textColor === '#ffffff' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.1)'
                                }}
                              />
                            </div>
                          </div>
                          <p className="text-xs font-medium text-center">{template.name}</p>
                          {template.description && (
                            <p className="text-[10px] text-gray-500 text-center mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              {template.description}
                            </p>
                          )}
                          {customization.template === key && (
                            <div className="absolute top-1 right-1">
                              <div className="w-3 h-3 bg-rose-500 rounded-full flex items-center justify-center">
                                <div className="w-1.5 h-1.5 bg-white rounded-full" />
                              </div>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Image Uploads */}
                <AccordionItem value="images" className="border rounded-lg">
                  <AccordionTrigger className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors hover:no-underline">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      <Label className="text-sm font-medium">Images</Label>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pb-3">
                    <div className="space-y-2">
                    {/* Background Image */}
                    <div className="p-2 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">Background</span>
                        </div>
                        <div className="flex gap-1">
                          {customization.backgroundImage && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setCustomization({ ...customization, backgroundImage: undefined })
                              }
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => triggerImageUpload('background')}
                            disabled={uploadingImage === 'background'}
                          >
                            {uploadingImage === 'background' ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Upload className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                      {customization.backgroundImage && (
                        <>
                          <div className="mt-2 mx-auto relative overflow-hidden rounded border">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={customization.backgroundImage}
                              alt="Background preview"
                              className="max-w-full h-20 mx-auto object-cover"
                              style={{
                                filter: customization.backgroundBlur > 0 
                                  ? `blur(${customization.backgroundBlur}px)` 
                                  : 'none',
                                transform: customization.backgroundBlur > 0 
                                  ? 'scale(1.05)' 
                                  : 'none',
                              }}
                            />
                          </div>
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs">Blur: {customization.backgroundBlur}px</Label>
                            </div>
                            <Slider
                              value={[customization.backgroundBlur]}
                              onValueChange={([value]) => setCustomization({ ...customization, backgroundBlur: value })}
                              min={0}
                              max={20}
                              step={1}
                              className="w-full"
                            />
                          </div>
                        </>
                      )}
                    </div>

                    {/* Profile Image */}
                    <div className="p-2 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">Profile Photo</span>
                        </div>
                        <div className="flex gap-1">
                          {customization.profileImage && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setCustomization({ ...customization, profileImage: undefined })
                              }
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => triggerImageUpload('profile')}
                            disabled={uploadingImage === 'profile'}
                          >
                            {uploadingImage === 'profile' ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Upload className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                      {customization.profileImage && (
                        <>
                          <div className="mt-2 flex justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={customization.profileImage}
                              alt="Profile preview"
                              className="w-20 h-20 object-cover rounded-full border-2"
                              style={{
                                filter: customization.profileBlur > 0 ? `blur(${customization.profileBlur}px)` : 'none',
                              }}
                            />
                          </div>
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs">Blur: {customization.profileBlur}px</Label>
                            </div>
                            <Slider
                              value={[customization.profileBlur]}
                              onValueChange={([value]) => setCustomization({ ...customization, profileBlur: value })}
                              min={0}
                              max={20}
                              step={1}
                              className="w-full"
                            />
                          </div>
                        </>
                      )}
                    </div>

                    {/* Logo Image */}
                    <div className="p-2 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">Logo</span>
                        </div>
                        <div className="flex gap-1">
                          {customization.logoImage && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setCustomization({ ...customization, logoImage: undefined })
                              }
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => triggerImageUpload('logo')}
                            disabled={uploadingImage === 'logo'}
                          >
                            {uploadingImage === 'logo' ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Upload className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                      {customization.logoImage && (
                        <div className="mt-2 flex justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={customization.logoImage}
                            alt="Logo preview"
                            className="h-16 w-auto object-contain rounded border bg-white p-1"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Text Customization */}
                <AccordionItem value="textContent" className="border rounded-lg">
                  <AccordionTrigger className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Type className="h-4 w-4" />
                      <Label className="text-sm font-medium">Text Content</Label>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pb-3">
                    <div className="space-y-2">
                    <div>
                      <Label htmlFor="greeting" className="text-xs">Greeting</Label>
                      <Input
                        id="greeting"
                        value={customization.greetingText}
                        onChange={(e) =>
                          setCustomization({ ...customization, greetingText: e.target.value })
                        }
                        placeholder="You Are Cordially Invited"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="message" className="text-xs">Message</Label>
                      <Textarea
                        id="message"
                        value={customization.messageText}
                        onChange={(e) =>
                          setCustomization({ ...customization, messageText: e.target.value })
                        }
                        placeholder="Join us for a celebration"
                        rows={2}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="footer" className="text-xs">Footer</Label>
                      <Input
                        id="footer"
                        value={customization.footerText}
                        onChange={(e) =>
                          setCustomization({ ...customization, footerText: e.target.value })
                        }
                        placeholder="We look forward to your presence"
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                  </AccordionContent>
                </AccordionItem>

                {/* QR Code Customization */}
                <AccordionItem value="qrCode" className="border rounded-lg">
                  <AccordionTrigger className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors hover:no-underline">
                    <div className="flex items-center gap-2">
                      <QrCode className="h-4 w-4" />
                      <Label className="text-sm font-medium">QR Code</Label>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pb-3">
                    <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs">Size: {customization.qrSize}px</Label>
                      </div>
                      <Slider
                        value={[customization.qrSize]}
                        onValueChange={([value]) => setCustomization({ ...customization, qrSize: value })}
                        min={100}
                        max={300}
                        step={10}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Label className="text-xs mb-2 block">Foreground Color</Label>
                      <div className="flex gap-2 items-center">
                        <Input
                          type="color"
                          value={customization.qrForegroundColor}
                          onChange={(e) => setCustomization({ ...customization, qrForegroundColor: e.target.value })}
                          className="w-16 h-8"
                        />
                        <Input
                          type="text"
                          value={customization.qrForegroundColor}
                          onChange={(e) => setCustomization({ ...customization, qrForegroundColor: e.target.value })}
                          className="flex-1 h-8 text-xs"
                          placeholder="#000000"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs mb-2 block">Background Color</Label>
                      <div className="flex gap-2 items-center">
                        <Input
                          type="color"
                          value={customization.qrBackgroundColor}
                          onChange={(e) => setCustomization({ ...customization, qrBackgroundColor: e.target.value })}
                          className="w-16 h-8"
                        />
                        <Input
                          type="text"
                          value={customization.qrBackgroundColor}
                          onChange={(e) => setCustomization({ ...customization, qrBackgroundColor: e.target.value })}
                          className="flex-1 h-8 text-xs"
                          placeholder="#ffffff"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs mb-2 block">Error Correction Level</Label>
                      <Select
                        value={customization.qrErrorLevel}
                        onValueChange={(value: 'L' | 'M' | 'Q' | 'H') => 
                          setCustomization({ ...customization, qrErrorLevel: value })
                        }
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="L">L - Low (~7%)</SelectItem>
                          <SelectItem value="M">M - Medium (~15%)</SelectItem>
                          <SelectItem value="Q">Q - Quartile (~25%)</SelectItem>
                          <SelectItem value="H">H - High (~30%)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Text Styling */}
                <AccordionItem value="textStyling" className="border rounded-lg">
                  <AccordionTrigger className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Type className="h-4 w-4" />
                      <Label className="text-sm font-medium">Text Styling</Label>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pb-3">
                    <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs">Greeting Font Size: {customization.greetingFontSize}px</Label>
                      </div>
                      <Slider
                        value={[customization.greetingFontSize]}
                        onValueChange={([value]) => setCustomization({ ...customization, greetingFontSize: value })}
                        min={12}
                        max={48}
                        step={2}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs">Title Font Size: {customization.titleFontSize}px</Label>
                      </div>
                      <Slider
                        value={[customization.titleFontSize]}
                        onValueChange={([value]) => setCustomization({ ...customization, titleFontSize: value })}
                        min={20}
                        max={60}
                        step={2}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs">Message Font Size: {customization.messageFontSize}px</Label>
                      </div>
                      <Slider
                        value={[customization.messageFontSize]}
                        onValueChange={([value]) => setCustomization({ ...customization, messageFontSize: value })}
                        min={10}
                        max={32}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Label className="text-xs mb-2 block">Text Alignment</Label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={customization.textAlign === 'left' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCustomization({ ...customization, textAlign: 'left' })}
                          className="flex-1"
                        >
                          <AlignLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant={customization.textAlign === 'center' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCustomization({ ...customization, textAlign: 'center' })}
                          className="flex-1"
                        >
                          <AlignCenter className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant={customization.textAlign === 'right' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCustomization({ ...customization, textAlign: 'right' })}
                          className="flex-1"
                        >
                          <AlignRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Color Customization */}
                <AccordionItem value="colors" className="border rounded-lg">
                  <AccordionTrigger className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      <Label className="text-sm font-medium">Colors</Label>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pb-3">
                    <div className="space-y-3">
                    <div>
                      <Label className="text-xs mb-2 block">Text Color</Label>
                      <div className="flex gap-2 items-center">
                        <Input
                          type="color"
                          value={customization.customTextColor || selectedTemplate.textColor}
                          onChange={(e) => setCustomization({ ...customization, customTextColor: e.target.value })}
                          className="w-16 h-8"
                        />
                        <Input
                          type="text"
                          value={customization.customTextColor || selectedTemplate.textColor}
                          onChange={(e) => setCustomization({ ...customization, customTextColor: e.target.value })}
                          className="flex-1 h-8 text-xs"
                          placeholder={selectedTemplate.textColor}
                        />
                        {customization.customTextColor && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCustomization({ ...customization, customTextColor: undefined })}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs mb-2 block">Accent Color</Label>
                      <div className="flex gap-2 items-center">
                        <Input
                          type="color"
                          value={customization.customAccentColor || selectedTemplate.accentColor}
                          onChange={(e) => setCustomization({ ...customization, customAccentColor: e.target.value })}
                          className="w-16 h-8"
                        />
                        <Input
                          type="text"
                          value={customization.customAccentColor || selectedTemplate.accentColor}
                          onChange={(e) => setCustomization({ ...customization, customAccentColor: e.target.value })}
                          className="flex-1 h-8 text-xs"
                          placeholder={selectedTemplate.accentColor}
                        />
                        {customization.customAccentColor && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCustomization({ ...customization, customAccentColor: undefined })}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs mb-2 block">Background Color</Label>
                      <div className="flex gap-2 items-center">
                        <Input
                          type="color"
                          value={customization.customColor || selectedTemplate.background.split(' ')[0] || '#ffffff'}
                          onChange={(e) => setCustomization({ ...customization, customColor: e.target.value })}
                          className="w-16 h-8"
                        />
                        <Input
                          type="text"
                          value={customization.customColor || ''}
                          onChange={(e) => setCustomization({ ...customization, customColor: e.target.value })}
                          className="flex-1 h-8 text-xs"
                          placeholder="Custom background color"
                        />
                        {customization.customColor && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCustomization({ ...customization, customColor: undefined })}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs">Background Overlay Opacity: {customization.backgroundOpacity}%</Label>
                      </div>
                      <Slider
                        value={[customization.backgroundOpacity]}
                        onValueChange={([value]) => setCustomization({ ...customization, backgroundOpacity: value })}
                        min={0}
                        max={50}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Layout Controls */}
                <AccordionItem value="layout" className="border rounded-lg">
                  <AccordionTrigger className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Settings2 className="h-4 w-4" />
                      <Label className="text-sm font-medium">Layout</Label>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pb-3">
                    <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs">Card Padding: {customization.cardPadding}px</Label>
                      </div>
                      <Slider
                        value={[customization.cardPadding]}
                        onValueChange={([value]) => setCustomization({ ...customization, cardPadding: value })}
                        min={16}
                        max={64}
                        step={4}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs">Profile Image Size: {customization.profileImageSize}px</Label>
                      </div>
                      <Slider
                        value={[customization.profileImageSize]}
                        onValueChange={([value]) => setCustomization({ ...customization, profileImageSize: value })}
                        min={64}
                        max={256}
                        step={8}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs">Logo Size: {customization.logoImageSize}px</Label>
                      </div>
                      <Slider
                        value={[customization.logoImageSize]}
                        onValueChange={([value]) => setCustomization({ ...customization, logoImageSize: value })}
                        min={32}
                        max={128}
                        step={4}
                        className="w-full"
                      />
                    </div>
                  </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Reset Button */}
              <Button
                  variant="outline"
                  size="sm"
                  onClick={resetCustomization}
                  className="w-full"
                >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset to Defaults
              </Button>
            </TabsContent>

            {/* Preview Tab */}
            <TabsContent value="preview" className="space-y-4 mt-4">
              <div className="border-2 border-dashed rounded-lg p-4 sm:p-6 bg-gray-50 flex justify-center">
                <div className="w-full max-w-md">
                  {renderCard()}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default InviteCardDrawer
