'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Schedules() {
  return (
    <Card className="border border-gray-200 shadow-none">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-black">កាលវិភាគ (Schedule)</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">Schedule management coming soon...</p>
      </CardContent>
    </Card>
  )
}

