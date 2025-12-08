import React from 'react'
import Empty from '@/components/Empty'

function FinancialPage() {
  return (
    <div className="space-y-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial</h1>
          <p className="text-gray-600 mt-2">Manage your financial transactions</p>
        </div>
      </div>
      
      <Empty
        title="Coming Soon"
        description="We're building a comprehensive financial management system for you. Check back soon!"
        size="lg"
        animationUrl="/anim/upcomming.lottie"
        padding="lg"
      />
    </div>
  )
}

export default FinancialPage
