'use client'

import React from 'react'
import { AlertTriangle, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/shadcn-io/spinner/index'
import { Event } from '@/types/event'

interface EventDeleteModalProps {
  event: Event | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isDeleting?: boolean
}

export default function EventDeleteModal({
  event,
  open,
  onOpenChange,
  onConfirm,
  isDeleting = false,
}: EventDeleteModalProps) {
  const handleConfirm = () => {
    onConfirm()
  }

  if (!event) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-xl border-red-200 dark:border-red-900/50">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/30">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <DialogTitle className="text-xl font-semibold text-red-900 dark:text-red-100">
              Delete Event
            </DialogTitle>
          </div>
        </DialogHeader>
        <div className="text-left pt-2">
          <div className="space-y-3">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Are you sure you want to delete this event? This action cannot be undone.
            </p>
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-lg">
              <p className="text-xs font-medium text-red-900 dark:text-red-100 mb-1">
                Event Details:
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {event.title}
              </p>
              {event.guestCount > 0 && (
                <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                  This event has {event.guestCount} {event.guestCount === 1 ? 'guest' : 'guests'}.
                  All associated data will be permanently deleted.
                </p>
              )}
            </div>
            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-800 dark:text-amber-200">
                <strong>Warning:</strong> This will permanently delete the event, all guest information, 
                schedules, payments, and any other associated data. This action cannot be reversed.
              </p>
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2 flex ">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="rounded-lg"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="rounded-lg bg-red-600 hover:bg-red-700 focus:ring-red-500 dark:bg-red-600 dark:hover:bg-red-700"
          >
            {isDeleting ? (
              <>
                <Spinner className="h-4 w-4 mr-2" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Event
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

