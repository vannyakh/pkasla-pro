'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function QRGenerate() {
  return (
    <Card className="border border-gray-200 shadow-none">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-black">បង្កើតQR (Generate QR)</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">QR code generation coming soon...</p>
      </CardContent>
    </Card>
  )
}

