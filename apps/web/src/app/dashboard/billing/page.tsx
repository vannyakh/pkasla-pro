import React from 'react'
import { CreditCard, Download, Plus } from 'lucide-react'

export default function BillingPage() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Billing</h1>
          <p className="text-gray-600 mt-2">Manage your subscription and payment methods</p>
        </div>
        <button className="bg-rose-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-rose-600 transition flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Add Payment Method</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Methods</h2>
            <div className="space-y-4">
              {[1, 2].map((item) => (
                <div key={item} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <CreditCard className="h-8 w-8 text-gray-400" />
                    <div>
                      <p className="font-semibold text-gray-900">**** **** **** 4242</p>
                      <p className="text-sm text-gray-600">Expires 12/25</p>
                    </div>
                  </div>
                  <button className="text-rose-500 hover:text-rose-600 font-medium">Remove</button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Billing History</h2>
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">Premium Plan</p>
                    <p className="text-sm text-gray-600">December {15 + item}, 2024</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="font-bold text-gray-900">$59.00</span>
                    <button className="text-rose-500 hover:text-rose-600">
                      <Download className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Current Plan</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Plan</p>
              <p className="text-2xl font-bold text-gray-900">Premium</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Next Billing Date</p>
              <p className="text-lg font-semibold text-gray-900">January 15, 2025</p>
            </div>
            <button className="w-full bg-rose-500 text-white py-3 rounded-lg font-semibold hover:bg-rose-600 transition">
              Upgrade Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

