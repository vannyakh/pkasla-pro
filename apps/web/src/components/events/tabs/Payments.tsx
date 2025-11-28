'use client'

import React from 'react'
import { Download, Edit, Trash2, User, FileText, Calendar, DollarSign } from 'lucide-react'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Payment {
  id: string
  guestName: string
  amount: number
  currency: 'USD' | 'KHR'
  method: 'KHQR' | 'Cash' | 'Bank Transfer'
  createdAt: string | Date
}

interface PaymentsProps {
  payments?: Payment[]
  totalRiel?: number
  totalDollars?: number
  totalGuests?: number
  contributingGuests?: number
}

export default function Payments({
  payments = [],
  totalRiel = 0,
  totalDollars = 0,
  totalGuests = 0,
  contributingGuests = 0,
}: PaymentsProps) {
  const formatCurrency = (amount: number, currency: 'USD' | 'KHR') => {
    if (currency === 'USD') {
      return `${amount.toLocaleString()} ដុល្លារ`
    }
    return `${amount.toLocaleString()} រៀល`
  }

  const formatDateKhmer = (date: string | Date) => {
    const d = new Date(date)
    return d.toLocaleDateString('km-KH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  const getMethodLabel = (method: string) => {
    const methodMap: Record<string, string> = {
      'KHQR': 'KHQR',
      'Cash': 'សាច់ប្រាក់',
      'Bank Transfer': 'ការផ្ទេរប្រាក់',
    }
    return methodMap[method] || method
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Riel */}
        <Card className="border border-gray-200 p-4 shadow-none">
          <CardContent className="p-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">សរុប ប្រាក់រៀល</p>
                <p className="text-lg font-bold text-black">{totalRiel.toLocaleString()} រៀល</p>
              </div>
              <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Dollars */}
        <Card className="border border-gray-200 p-4 shadow-none">
          <CardContent className="p-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">សរុប ប្រាក់ដុល្លារ</p>
                <p className="text-lg font-bold text-black">{totalDollars.toLocaleString()} ដុល្លារ</p>
              </div>
              <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Guests */}
        <Card className="border border-gray-200 p-4 shadow-none">
          <CardContent className="p-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">ចំនួនភ្ញៀវសរុប</p>
                <p className="text-lg font-bold text-black">{totalGuests} នាក់</p>
              </div>
              <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                <FileText className="h-5 w-5 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contributing Guests */}
        <Card className="border border-gray-200 p-4 shadow-none">
          <CardContent className="p-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">ចំនួនភ្ញៀវដែលបានចងដៃ</p>
                <p className="text-lg font-bold text-black">{contributingGuests} នាក់</p>
              </div>
              <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Calendar className="h-5 w-5 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-black">តារាងចំណងដៃ</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs h-9">
                <Download className="h-3.5 w-3.5 mr-1.5" />
                ទាញយក
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Excel</DropdownMenuItem>
              <DropdownMenuItem>PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Card className="border border-gray-200 shadow-none">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="p-3 text-left text-sm font-semibold text-black">ឈ្មោះ</th>
                    <th className="p-3 text-left text-sm font-semibold text-black">ចំនួនចំណងដៃ</th>
                    <th className="p-3 text-left text-sm font-semibold text-black">តាមរយៈ</th>
                    <th className="p-3 text-left text-sm font-semibold text-black">ពេលវេលា</th>
                    <th className="p-3 text-right text-sm font-semibold text-black"></th>
                  </tr>
                </thead>
                <tbody>
                  {payments.length > 0 ? (
                    payments.map((payment) => (
                      <tr key={payment.id} className="border-b border-gray-200 last:border-b-0">
                        <td className="p-3">
                          <p className="text-sm font-semibold text-black">{payment.guestName}</p>
                        </td>
                        <td className="p-3">
                          <p className="text-sm text-black">
                            {formatCurrency(payment.amount, payment.currency)}
                          </p>
                        </td>
                        <td className="p-3">
                          <p className="text-sm text-black">{getMethodLabel(payment.method)}</p>
                        </td>
                        <td className="p-3">
                          <p className="text-sm text-black">{formatDateKhmer(payment.createdAt)}</p>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs h-7 w-7 p-0"
                              onClick={() => {
                                // Handle edit
                                console.log('Edit payment', payment.id)
                              }}
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs h-7 w-7 p-0 text-red-600 hover:text-red-700"
                              onClick={() => {
                                // Handle delete
                                console.log('Delete payment', payment.id)
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-8 text-center">
                        <p className="text-sm text-gray-600">មិនទាន់មានចំណងដៃ</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {payments.length > 0 && (
              <div className="p-3 border-t border-gray-200 text-center">
                <p className="text-xs text-gray-600">
                  សរុប {payments.length} / {payments.length} ចំណងដៃ
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

