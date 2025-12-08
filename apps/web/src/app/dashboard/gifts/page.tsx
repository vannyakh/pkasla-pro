import React from 'react'
import Empty from '@/components/Empty'

function GiftsPage() {
  return (
    <div className="space-y-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gifts</h1>
          <p className="text-gray-600 mt-2">Manage your gifts</p>
        </div>
      </div>
      
      <Empty
        title="Coming Soon"
        description="We're working on bringing you an amazing gift management experience. Stay tuned!"
        animationUrl="/anim/upcomming.lottie"
        size="lg"
        padding="lg"
      />
    </div>
  )
}

export default GiftsPage
