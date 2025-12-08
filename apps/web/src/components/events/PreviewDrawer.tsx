'use client'

import React from 'react'
import { Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  TabsContents,
} from '@/components/ui/shadcn-io/tabs'
import Iphone15Pro from '@/components/ui/shadcn-io/iphone-15-pro'
import { Android } from '@/components/ui/shadcn-io/android'

function PreviewDrawer() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs">
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader className="shrink-0">
          <SheetTitle>Event Preview</SheetTitle>
          <SheetDescription>
            Preview how your event will appear to guests
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 flex flex-col mt-6 min-h-0">
          <Tabs defaultValue="ios" className="w-full flex-1 flex flex-col">
            <TabsList className="w-full shrink-0">
              <TabsTrigger value="ios" className="flex-1">
                iOS
              </TabsTrigger>
              <TabsTrigger value="android" className="flex-1">
                Android
              </TabsTrigger>
            </TabsList>
            <TabsContents className="flex-1 mt-6 min-h-0">
              <TabsContent value="ios" className="mt-0 h-full">
                <div className="flex justify-center items-center h-full min-h-0">
                  <Iphone15Pro className="h-full max-h-full w-auto" />
                </div>
              </TabsContent>
              <TabsContent value="android" className="mt-0 h-full">
                <div className="flex justify-center items-center h-full min-h-0">
                  <Android className="h-full max-h-full w-auto" />
                </div>
              </TabsContent>
            </TabsContents>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default PreviewDrawer
