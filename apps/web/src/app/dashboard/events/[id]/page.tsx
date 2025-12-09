"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Calendar,
  Settings as SettingsIcon,
  FileText,
  QrCode,
  Info,
  UserCheck,
  ArrowLeft,
  DollarSign,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useEvent, useUpdateEvent } from "@/hooks/api/useEvent";
import type { EventStatus } from "@/types/event";
import {
  useGuestsByEvent,
  useCreateGuest,
  useUpdateGuest,
  useDeleteGuest,
} from "@/hooks/api/useGuest";
import type { Guest as GuestType } from "@/types/guest";
import {
  Overview,
  Guests,
  Agenda,
  Settings,
  Templates,
  QRGenerate,
  Payments,
} from "@/components/events/tabs";
import { EventCoverHeader } from "@/components/events";
import { getGuestTagColor } from "@/helpers";
import PageLoading from "@/components/PageLoading";

// Extended guest interface for UI display (includes gift info)
interface DisplayGuest extends Omit<GuestType, "tag"> {
  tag?: {
    label: string;
    color: "red" | "blue" | "green";
    icon?: string;
  };
  gift?: {
    id: string;
    date: string;
    type: string;
    amount?: number;
    currency?: string;
  };
}

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Unwrap params Promise
  const { id } = React.use(params);

  // Fetch event data
  const {
    data: event,
    isLoading: eventLoading,
    error: eventError,
  } = useEvent(id);
  const { data: guests = [], isLoading: guestsLoading } = useGuestsByEvent(id);
  const createGuestMutation = useCreateGuest();
  const updateGuestMutation = useUpdateGuest();
  const deleteGuestMutation = useDeleteGuest();
  const updateEventMutation = useUpdateEvent();

  const [isGuestDrawerOpen, setIsGuestDrawerOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<GuestType | null>(null);
  const [isTabsDrawerOpen, setIsTabsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGuestForGift, setSelectedGuestForGift] =
    useState<DisplayGuest | null>(null);
  const [selectedGuestForView, setSelectedGuestForView] =
    useState<DisplayGuest | null>(null);
  
  // Initialize activeTab from URL search params, fallback to "overview"
  const validTabs = useMemo(() => ["overview", "guests", "payments", "schedule", "templates", "qr", "settings", "stores"] as const, []);
  type ValidTab = typeof validTabs[number];
  const tabFromUrl = searchParams?.get("tab");
  const initialTab: ValidTab = (tabFromUrl && validTabs.includes(tabFromUrl as ValidTab)) ? (tabFromUrl as ValidTab) : "overview";
  const [activeTab, setActiveTab] = useState<ValidTab>(initialTab);

  // Update activeTab when URL search params change
  useEffect(() => {
    const newTabFromUrl = searchParams?.get("tab");
    if (newTabFromUrl && validTabs.includes(newTabFromUrl as ValidTab) && newTabFromUrl !== activeTab) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveTab(newTabFromUrl as ValidTab);
    }
  }, [searchParams, activeTab, validTabs]);

  // Transform guests for display (add tag and gift info if needed)
  const displayGuests: DisplayGuest[] = useMemo(() => {
    return guests.map((guest) => {
      const { tag: tagString, ...restGuest } = guest;
      const displayGuest: DisplayGuest = { ...restGuest };

      // Map tag string to display format
      if (tagString) {
        const tagMap: Record<
          string,
          { label: string; color: "red" | "blue" | "green" }
        > = {
          bride: { label: "ភ្ញៀវកូនក្រមុំ", color: "red" },
          groom: { label: "ភ្ញៀវកូនកំលោះ", color: "blue" },
        };
        const tagInfo = tagMap[tagString] || {
          label: tagString,
          color: "green",
        };
        displayGuest.tag = tagInfo;
      }

      // For now, gift info is not stored in backend (only hasGivenGift boolean)
      // This would need to be implemented in a separate gifts/payments table
      // For now, we'll just show hasGivenGift status

      return displayGuest;
    });
  }, [guests]);

  // Get guests who have given gifts
  const guestsWithGifts = displayGuests.filter((guest) => guest.hasGivenGift);
  const giftCount = guestsWithGifts.length;

  // Filter guests by search query
  const filteredGuests = displayGuests.filter(
    (guest) =>
      guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (guest.email &&
        guest.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (guest.phone &&
        guest.phone.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Loading state
  if (eventLoading || guestsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <PageLoading fullScreen={false} size="sm" />
      </div>
    );
  }

  // Error state
  if (eventError || !event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-sm text-red-600 mb-4">
            {eventError?.message || "Failed to load event"}
          </p>
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Handle update event status
  const handleUpdateStatus = async (newStatus: EventStatus) => {
    await updateEventMutation.mutateAsync({
      id,
      data: { status: newStatus },
    });
  };

  // Handle create guest
  const handleCreateGuest = async (formData: {
    name: string;
    phone?: string;
    occupation?: string;
    notes?: string;
    tag?: string;
    address?: string;
    province?: string;
  }) => {
    await createGuestMutation.mutateAsync({
      name: formData.name,
      phone: formData.phone,
      eventId: id,
      tag: formData.tag,
      occupation: formData.occupation,
      notes: formData.notes,
      address: formData.address,
      province: formData.province,
    });
    setIsGuestDrawerOpen(false);
  };

  // Handle update guest (for gift payment)
  const handleGiftPayment = async (guestId: string) => {
    await updateGuestMutation.mutateAsync({
      id: guestId,
      data: {
        hasGivenGift: true,
        // Note: Gift details (amount, type, etc.) would need a separate gifts/payments table
        // For now, we're just marking hasGivenGift as true
      },
    });
    setSelectedGuestForGift(null);
  };

  // Handle delete guest
  const handleDeleteGuest = async (guestId: string) => {
    if (confirm("Are you sure you want to delete this guest?")) {
      await deleteGuestMutation.mutateAsync({ id: guestId, eventId: id });
    }
  };

  return (
    <div className="space-y-6">
      {/* Event Info Block */}
      <EventCoverHeader
        event={event}
        onUpdateStatus={handleUpdateStatus}
        updateEventMutation={updateEventMutation}
      />
      {/* Tabs Section */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ValidTab)} className="w-full">
        {/* Desktop/Tablet Tabs - Hidden on mobile */}
        <div className="hidden md:block w-full mb-4 bg-gray-100 p-1 rounded-lg">
          <TabsList className="grid w-full md:grid-cols-4 lg:grid-cols-8 gap-2 bg-transparent p-0 h-auto">
            <TabsTrigger value="overview" className="text-xs">
              <Info className="h-3.5 w-3.5 mr-1.5" />
              ទូទៅ
            </TabsTrigger>
            <TabsTrigger value="guests" className="text-xs">
              <UserCheck className="h-3.5 w-3.5 mr-1.5" />
              ភ្ញៀវកិត្តយស
            </TabsTrigger>
            <TabsTrigger value="payments" className="text-xs">
              <DollarSign className="h-3.5 w-3.5 mr-1.5" />
              ចំណងដៃ
            </TabsTrigger>
            <TabsTrigger value="schedule" className="text-xs">
              <Calendar className="h-3.5 w-3.5 mr-1.5" />
              កាលវិភាគ
            </TabsTrigger>
            <TabsTrigger value="templates" className="text-xs">
              <FileText className="h-3.5 w-3.5 mr-1.5" />
              គំរូធៀបខ្ញុំ
            </TabsTrigger>
            <TabsTrigger value="qr" className="text-xs">
              <QrCode className="h-3.5 w-3.5 mr-1.5" />
              បង្កើតQR
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs">
              <SettingsIcon className="h-3.5 w-3.5 mr-1.5" />
              កែប្រែ
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Mobile Bottom Navigation - Modern Toolbar Style */}
        <div className="md:hidden fixed bottom-4 left-4 right-4 z-50">
          <div className="bg-gray-900/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-800">
            <TabsList className="grid grid-cols-5 w-full h-14 gap-0 bg-transparent p-1">
              <TabsTrigger
                value="overview"
                className="flex items-center justify-center h-full rounded-xl data-[state=active]:bg-white/10 data-[state=inactive]:text-gray-400 data-[state=active]:text-white transition-all"
              >
                <Info className="h-5 w-5" />
              </TabsTrigger>
              <TabsTrigger
                value="guests"
                className="flex items-center justify-center h-full rounded-xl data-[state=active]:bg-white/10 data-[state=inactive]:text-gray-400 data-[state=active]:text-white transition-all"
              >
                <UserCheck className="h-5 w-5" />
              </TabsTrigger>
              <TabsTrigger
                value="payments"
                className="flex items-center justify-center h-full rounded-xl data-[state=active]:bg-white/10 data-[state=inactive]:text-gray-400 data-[state=active]:text-white transition-all"
              >
                <DollarSign className="h-5 w-5" />
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="flex items-center justify-center h-full rounded-xl data-[state=active]:bg-white/10 data-[state=inactive]:text-gray-400 data-[state=active]:text-white transition-all"
              >
                <SettingsIcon className="h-5 w-5" />
              </TabsTrigger>
              <Drawer open={isTabsDrawerOpen} onOpenChange={setIsTabsDrawerOpen}>
                <DrawerTrigger asChild>
                  <button
                    className={`flex items-center justify-center h-full rounded-xl transition-all ${
                      activeTab === "schedule" ||
                      activeTab === "templates" ||
                      activeTab === "stores" ||
                      activeTab === "qr"
                        ? "bg-white/10 text-white"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>ជ្រើសរើសផ្ទាំង</DrawerTitle>
                </DrawerHeader>
                <div className="p-4 space-y-2">
                  <button
                    onClick={() => {
                      setActiveTab("schedule");
                      setIsTabsDrawerOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left ${
                      activeTab === "schedule"
                        ? "bg-gray-100"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <Calendar className="h-5 w-5" />
                    <span className="text-sm font-medium">កាលវិភាគ</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("templates");
                      setIsTabsDrawerOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left ${
                      activeTab === "templates"
                        ? "bg-gray-100"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <FileText className="h-5 w-5" />
                    <span className="text-sm font-medium">គំរូធៀបខ្ញុំ</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("stores");
                      setIsTabsDrawerOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left ${
                      activeTab === "stores"
                        ? "bg-gray-100"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <FileText className="h-5 w-5" />
                    <span className="text-sm font-medium">ហាងគំរូធៀប</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("qr");
                      setIsTabsDrawerOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left ${
                      activeTab === "qr" ? "bg-gray-100" : "hover:bg-gray-50"
                    }`}
                  >
                    <QrCode className="h-5 w-5" />
                    <span className="text-sm font-medium">បង្កើតQR</span>
                  </button>
                </div>
              </DrawerContent>
            </Drawer>
          </TabsList>
          </div>
        </div>

        {/* ទូទៅ Tab - View Only */}
        <TabsContent value="overview" className="mt-4 md:mt-4 mb-24 md:mb-4">
          <Overview
            event={event}
            guestsWithGifts={guestsWithGifts}
            giftCount={giftCount}
          />
        </TabsContent>

        {/* Guests Tab */}
        <TabsContent value="guests" className="mt-4 md:mt-4 mb-24 md:mb-4">
          <Guests
            displayGuests={displayGuests}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filteredGuests={filteredGuests}
            isGuestDrawerOpen={isGuestDrawerOpen}
            onGuestDrawerOpenChange={(open) => {
              setIsGuestDrawerOpen(open)
              if (!open) {
                setEditingGuest(null)
              }
            }}
            editingGuest={editingGuest}
            onEditingGuestChange={setEditingGuest}
            selectedGuestForGift={selectedGuestForGift}
            onSelectedGuestForGiftChange={(guest) =>
              setSelectedGuestForGift(guest)
            }
            selectedGuestForView={selectedGuestForView}
            onSelectedGuestForViewChange={(guest) =>
              setSelectedGuestForView(guest)
            }
            onCreateGuest={handleCreateGuest}
            onGiftPayment={handleGiftPayment}
            onDeleteGuest={handleDeleteGuest}
            eventId={id}
            router={router}
            createGuestMutation={createGuestMutation}
            updateGuestMutation={updateGuestMutation}
            deleteGuestMutation={deleteGuestMutation}
            getTagColor={getGuestTagColor}
            rawGuests={guests}
          />
        </TabsContent>
        {/* Payments Tab */}
        <TabsContent value="payments" className="mt-4 md:mt-4 mb-24 md:mb-4">
          <Payments eventId={id} />
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="mt-4 md:mt-4 mb-24 md:mb-4">
          <Agenda eventId={id} />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-4 md:mt-4 mb-24 md:mb-4">
          <Settings
            event={event}
            onUpdateStatus={handleUpdateStatus}
            updateEventMutation={updateEventMutation}
          />
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="mt-4 md:mt-4 mb-24 md:mb-4">
          <Templates eventId={id} />
        </TabsContent>

        {/* QR Code Tab */}
        <TabsContent value="qr" className="mt-4 md:mt-4 mb-24 md:mb-4">
          <QRGenerate eventId={id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
