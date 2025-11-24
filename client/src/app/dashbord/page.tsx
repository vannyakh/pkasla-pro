'use client'

import React from 'react'
import Link from 'next/link'
import { Calendar, Users, CreditCard, TrendingUp, Plus, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { Billing } from '@/types/billing'

export default function DashboardPage() {
  const { user } = useAuth()
  
  // Sample subscription data - TODO: Replace with API call
  const currentSubscription: Billing | null = {
    id: '1',
    userId: user?.id || '1',
    plan: 'premium',
    amount: 59,
    status: 'active',
    nextBillingDate: '2024-12-20T00:00:00Z',
    createdAt: '2024-01-15T10:00:00Z',
  }
  
  const stats = [
    { label: 'My Events', value: '12', icon: Calendar },
    { label: 'My Guests', value: '1,234', icon: Users },
    { label: 'Revenue', value: '$45,678', icon: CreditCard },
    { label: 'Growth', value: '+12.5%', icon: TrendingUp },
  ]

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'enterprise':
        return 'default'
      case 'premium':
        return 'secondary'
      case 'basic':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'default'
      case 'cancelled':
        return 'secondary'
      case 'expired':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-black">Dashboard</h1>
          <p className="text-xs text-gray-600 mt-0.5">
            {user?.role === 'admin' ? 'Admin - Full Access' : 'Normal User - Manage Your Events'}
          </p>
        </div>
        <Link href="/dashbord/event/new">
          <Button size="sm" className="text-xs">
            <Plus className="h-3 w-3 mr-1.5" />
            New Event
          </Button>
        </Link>
      </div>

      {/* Role Info for Normal Users */}
      {user?.role === 'user' && (
        <Card className="mb-4 border border-gray-200">
          <CardContent className="p-3">
            <div className="text-xs text-gray-700">
              <p className="font-medium text-black mb-1">Your Role: Normal User</p>
              <p>You can create and manage your own wedding events. You cannot access admin features.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Role Info for Admins */}
      {user?.role === 'admin' && (
        <Card className="mb-4 border border-gray-200">
          <CardContent className="p-3">
            <div className="text-xs text-gray-700">
              <p className="font-medium text-black mb-1">Your Role: Admin</p>
              <p>You have full access. You can manage all users and events. <Link href="/admin" className="text-black underline">Go to Admin Panel</Link></p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="border border-gray-200">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 mb-0.5">{stat.label}</p>
                    <p className="text-base font-semibold text-black">{stat.value}</p>
                  </div>
                  <Icon className="h-5 w-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Subscription Card */}
      <Card className="mb-4 border border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-black">Current Subscription</CardTitle>
            {currentSubscription && (
              <Badge variant={getStatusColor(currentSubscription.status)} className="text-xs capitalize">
                {currentSubscription.status}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {currentSubscription ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-600 mb-1">Plan</p>
                <div className="flex items-center gap-2">
                  <Badge variant={getPlanColor(currentSubscription.plan)} className="text-xs capitalize">
                    {currentSubscription.plan}
                  </Badge>
                  <span className="text-xs font-semibold text-black">${currentSubscription.amount}/month</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Next Billing Date</p>
                <p className="text-xs font-semibold text-black">
                  {formatDate(currentSubscription.nextBillingDate)}
                </p>
              </div>
              <div className="flex items-end">
                <Link href="/dashbord/billing" className="w-full">
                  <Button variant="outline" className="w-full text-xs h-8" size="sm">
                    Manage Subscription
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-600 mb-3">No active subscription</p>
              <Link href="/dashbord/billing">
                <Button variant="outline" className="text-xs h-8" size="sm">
                  Subscribe Now
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card className="border border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-black">Recent Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[1, 2, 3].map((item) => (
                <div key={item} className="p-2 border border-gray-200 rounded text-xs">
                  <p className="font-medium text-black">Event {item}</p>
                  <p className="text-gray-600 text-xs">Date {item}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-black">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            <Link href="/dashbord/event/new" className="block">
              <Button variant="outline" className="w-full justify-start text-xs h-8" size="sm">
                Create Event
              </Button>
            </Link>
            <Link href="/dashbord/guest" className="block">
              <Button variant="outline" className="w-full justify-start text-xs h-8" size="sm">
                Manage Guests
              </Button>
            </Link>
            <Link href="/dashbord/report" className="block">
              <Button variant="outline" className="w-full justify-start text-xs h-8" size="sm">
                View Reports
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
