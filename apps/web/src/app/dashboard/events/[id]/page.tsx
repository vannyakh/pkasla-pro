"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Users,
  MapPin,
  Settings as SettingsIcon,
  FileText,
  QrCode,
  Info,
  UserCheck,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  DollarSign,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Schedules,
  Settings,
  Templates,
  QRGenerate,
  Payments,
  Stores,
} from "@/components/events/tabs";

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
  const [isTabsDrawerOpen, setIsTabsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGuestForGift, setSelectedGuestForGift] =
    useState<DisplayGuest | null>(null);
  const [selectedGuestForView, setSelectedGuestForView] =
    useState<DisplayGuest | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

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
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
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

  const getStatusLabel = (status: EventStatus) => {
    const labels: Record<EventStatus, string> = {
      draft: "ព្រាង",
      published: "បានចុះផ្សាយ",
      completed: "បានបញ្ចប់",
      cancelled: "បានលុបចោល",
    };
    return labels[status];
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

  const getTagColor = (color?: string) => {
    switch (color) {
      case "red":
        return "bg-gray-100 text-gray-700 border-gray-200";
      case "blue":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "green":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "default";
      case "draft":
        return "secondary";
      case "completed":
        return "outline";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  // mockup data for stores template
  const handleViewSample = (templateId: string) => {
    console.log("View sample template", templateId);
  };
  const handleBuyNow = (templateId: string) => {
    console.log("Buy now template", templateId);
  };
  interface StoresProps {
    id: string;
    name: string;
    image: string;
    price: number;
    category: string;
    previewUrl?: string;
  }
  const templates: StoresProps[] = [
    {
      id: "1",
      name: "Sample Template 1",
      image:
        "https://i.pinimg.com/1200x/88/c1/0d/88c10d4fb189790cb4cf673c9f604665.jpg",
      price: 100,
      category: "Sample Category",
    },
    {
      id: "2",
      name: "Sample Template 2",
      image:
        "https://i.pinimg.com/1200x/97/8d/71/978d715a8ede8b69000f3d0eaf6d8cbc.jpg",
      price: 200,
      category: "Sample Category",
    },
    {
      id: "3",
      name: "Sample Template 3",
      image:
        "https://i.pinimg.com/1200x/7a/07/ae/7a07aef417a460bd23706a6cb6976bc7.jpg",
      price: 300,
      category: "Sample Category",
    },
  ];
  return (
    <div className="space-y-6">
      {/* Event Info Block */}
      <div
        className="relative bg-cover bg-center rounded-xl overflow-hidden border border-gray-200 shadow-lg"
        style={{
          backgroundImage: `url(${event.coverImage})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60 z-0" />
        <Card className="shadow-none border-none bg-transparent z-10 relative w-full h-full">
          <div className="flex items-start justify-between gap-2 sm:gap-4 px-3 sm:px-4 py-3 sm:py-4">
            <div className="flex-1 space-y-2 min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-white drop-shadow-lg break-words">
                  {event.title}
                </CardTitle>
                <Badge
                  variant={getStatusColor(event.status)}
                  className="capitalize text-xs px-2.5 py-1 bg-white/10 backdrop-blur-sm border-white/20 text-white"
                >
                  {event.status}
                </Badge>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 shrink-0"
                  disabled={updateEventMutation.isPending}
                >
                  <SettingsIcon className="h-4 w-4 mr-1.5" />
                  {updateEventMutation.isPending
                    ? "កំពុងធ្វើ..."
                    : `ស្ថានភាព: ${getStatusLabel(event.status)}`}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[180px] z-50">
                {(
                  [
                    "draft",
                    "published",
                    "completed",
                    "cancelled",
                  ] as EventStatus[]
                ).map((status) => (
                  <DropdownMenuItem
                    key={status}
                    onSelect={(e) => {
                      e.preventDefault();
                      if (
                        event.status !== status &&
                        !updateEventMutation.isPending
                      ) {
                        handleUpdateStatus(status);
                      }
                    }}
                    disabled={
                      event.status === status || updateEventMutation.isPending
                    }
                    className={
                      event.status === status ? "bg-gray-100" : "cursor-pointer"
                    }
                  >
                    <span className="flex-1">{getStatusLabel(status)}</span>
                    {event.status === status && (
                      <CheckCircle2 className="h-4 w-4 ml-auto" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {/* box content info */}
          <div className="px-3 sm:px-4 pb-3 sm:pb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 hover:bg-white/15 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-white/90" />
                  <p className="text-xs font-medium text-white/80 uppercase tracking-wide">
                    កាលបរិច្ឆេទ
                  </p>
                </div>
                <p className="text-base font-bold text-white">
                  {formatDate(
                    typeof event.date === "string"
                      ? event.date
                      : event.date.toISOString()
                  )}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 hover:bg-white/15 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-white/90" />
                  <p className="text-xs font-medium text-white/80 uppercase tracking-wide">
                    ទីតាំង
                  </p>
                </div>
                <p className="text-base font-bold text-white">{event.venue}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 hover:bg-white/15 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-white/90" />
                  <p className="text-xs font-medium text-white/80 uppercase tracking-wide">
                    ភ្ញៀវ
                  </p>
                </div>
                <p className="text-base font-bold text-white">
                  {event.guestCount} នាក់
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 hover:bg-white/15 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-white/90" />
                  <p className="text-xs font-medium text-white/80 uppercase tracking-wide">
                    បានបង្កើត
                  </p>
                </div>
                <p className="text-base font-bold text-white">
                  {formatDateTime(
                    typeof event.createdAt === "string"
                      ? event.createdAt
                      : event.createdAt.toISOString()
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Description with divider */}
          {event.description && (
            <>
              <div className="px-3 sm:px-4">
                <div className="border-t border-white/20 mb-3 sm:mb-4"></div>
                <p className="text-xs sm:text-sm md:text-base text-white/95 drop-shadow-md break-words">
                  {event.description}
                </p>
              </div>
            </>
          )}
        </Card>
      </div>
      {/* Tabs Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
            <TabsTrigger value="stores" className="text-xs">
              <FileText className="h-3.5 w-3.5 mr-1.5" />
              ហាងគំរូធៀប
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

        {/* Mobile Bottom Navigation - 5 items with drawer for more */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg">
          <TabsList className="grid grid-cols-5 w-full h-16 gap-0 bg-transparent p-0">
            <TabsTrigger
              value="overview"
              className="flex flex-col items-center justify-center h-full text-[10px] px-1 data-[state=active]:bg-gray-100 rounded-none"
            >
              <Info className="h-4 w-4 mb-0.5" />
              <span>ទូទៅ</span>
            </TabsTrigger>
            <TabsTrigger
              value="guests"
              className="flex flex-col items-center justify-center h-full text-[10px] px-1 data-[state=active]:bg-gray-100 rounded-none"
            >
              <UserCheck className="h-4 w-4 mb-0.5" />
              <span>ភ្ញៀវ</span>
            </TabsTrigger>
            <TabsTrigger
              value="payments"
              className="flex flex-col items-center justify-center h-full text-[10px] px-1 data-[state=active]:bg-gray-100 rounded-none"
            >
              <DollarSign className="h-4 w-4 mb-0.5" />
              <span>ចំណងដៃ</span>
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="flex flex-col items-center justify-center h-full text-[10px] px-1 data-[state=active]:bg-gray-100 rounded-none"
            >
              <SettingsIcon className="h-4 w-4 mb-0.5" />
              <span>កែប្រែ</span>
            </TabsTrigger>
            <Drawer open={isTabsDrawerOpen} onOpenChange={setIsTabsDrawerOpen}>
              <DrawerTrigger asChild>
                <button
                  className={`flex flex-col items-center justify-center h-full text-[10px] px-1 rounded-none ${
                    activeTab === "schedule" ||
                    activeTab === "templates" ||
                    activeTab === "stores" ||
                    activeTab === "qr"
                      ? "bg-gray-100"
                      : ""
                  }`}
                >
                  <MoreHorizontal className="h-4 w-4 mb-0.5" />
                  <span>ច្រើនទៀត</span>
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

        {/* ទូទៅ Tab - View Only */}
        <TabsContent value="overview" className="mt-4 md:mt-4 mb-16 md:mb-4">
          <Overview
            event={event}
            guestsWithGifts={guestsWithGifts}
            giftCount={giftCount}
          />
        </TabsContent>

        {/* Guests Tab */}
        <TabsContent value="guests" className="mt-4 md:mt-4 mb-16 md:mb-4">
          <Guests
            displayGuests={displayGuests}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filteredGuests={filteredGuests}
            isGuestDrawerOpen={isGuestDrawerOpen}
            onGuestDrawerOpenChange={setIsGuestDrawerOpen}
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
            getTagColor={getTagColor}
          />
        </TabsContent>
        {/* Payments Tab */}
        <TabsContent value="payments" className="mt-4 md:mt-4 mb-16 md:mb-4">
          <Payments eventId={id} />
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="mt-4 md:mt-4 mb-16 md:mb-4">
          <Schedules />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-4 md:mt-4 mb-16 md:mb-4">
          <Settings
            event={event}
            onUpdateStatus={handleUpdateStatus}
            updateEventMutation={updateEventMutation}
          />
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="mt-4 md:mt-4 mb-16 md:mb-4">
          <Templates />
        </TabsContent>

        {/* Stores Tab */}
        <TabsContent value="stores" className="mt-4 md:mt-4 mb-16 md:mb-4">
          <Stores
            templates={templates}
            onViewSample={handleViewSample}
            onBuyNow={handleBuyNow}
          />
        </TabsContent>

        {/* QR Code Tab */}
        <TabsContent value="qr" className="mt-4 md:mt-4 mb-16 md:mb-4">
          <QRGenerate />
        </TabsContent>
      </Tabs>
    </div>
  );
}
