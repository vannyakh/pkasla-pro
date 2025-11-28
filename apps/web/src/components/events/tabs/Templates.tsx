'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Templates() {
  return (
    <Card className="border border-gray-200 shadow-none">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-black">គំរូធៀបខ្ញុំ (My Templates)</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">Template management coming soon...</p>
      </CardContent>
    </Card>
  )
}

