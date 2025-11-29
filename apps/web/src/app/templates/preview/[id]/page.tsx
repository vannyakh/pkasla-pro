'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import TemplatePreview from '@/components/templates/TemplatePreview'

export default function TemplatePreviewPage() {
  const params = useParams()
  const templateId = params?.id as string

  return <TemplatePreview templateId={templateId} />
}

