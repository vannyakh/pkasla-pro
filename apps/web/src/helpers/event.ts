/**
 * Event-related helper functions
 */

import type { VariantProps } from 'class-variance-authority'
import { badgeVariants } from '@/components/ui/badge'
import type { EventStatus } from '@/types/event'

type BadgeVariant = VariantProps<typeof badgeVariants>['variant']

/**
 * Get badge color variant based on event status
 */
export function getEventStatusColor(
  status: string
): BadgeVariant {
  switch (status) {
    case 'published':
      return 'default'
    case 'draft':
      return 'secondary'
    case 'completed':
      return 'outline'
    case 'cancelled':
      return 'destructive'
    default:
      return 'outline'
  }
}

/**
 * Get Khmer label for event status
 */
export function getEventStatusLabel(status: EventStatus): string {
  const labels: Record<EventStatus, string> = {
    draft: 'ព្រាង',
    published: 'បានចុះផ្សាយ',
    completed: 'បានបញ្ចប់',
    cancelled: 'បានលុបចោល',
  }
  return labels[status]
}

/**
 * Get CSS classes for guest tag colors
 */
export function getGuestTagColor(color?: string): string {
  switch (color) {
    case 'red':
      return 'bg-gray-100 text-gray-700 border-gray-200'
    case 'blue':
      return 'bg-blue-100 text-blue-700 border-blue-200'
    case 'green':
      return 'bg-green-100 text-green-700 border-green-200'
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

