"use client";

import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  QrCode,
  Download,
  Users,
  Gift,
  Calendar,
  MapPin,
  ExternalLink,
  Clock,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { Event } from "@/types/event";
import Image from "next/image";
import { ImageZoom } from "@/components/ui/shadcn-io/image-zoom";
import { format } from "date-fns";
import { km } from "date-fns/locale";
import { Separator } from "@/components/ui/separator";

interface DisplayGuest {
  id: string;
  name: string;
  createdAt: string | Date;
  hasGivenGift?: boolean;
}

type OverviewProps = {
  event: Event;
  guestsWithGifts?: DisplayGuest[];
  giftCount?: number;
};

export default function Overview({
  event,
  guestsWithGifts = [],
  giftCount = 0,
}: OverviewProps) {
  // Calculate statistics
  const totalGuests = event.guestCount || 0;
  const giftPercentage =
    totalGuests > 0 ? Math.round((giftCount / totalGuests) * 100) : 0;
  const pendingGuests = totalGuests - giftCount;

  // Format event date
  const eventDate = event.date ? new Date(event.date) : null;
  const formattedDate = eventDate
    ? format(eventDate, "EEEE, d MMMM yyyy", { locale: km })
    : "មិនទាន់កំណត់";
  const formattedTime = eventDate ? format(eventDate, "h:mm a") : "";

  // Get event type label in Khmer
  const getEventTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      wedding: "ពិធីរៀបការ",
      engagement: "ពិធីភ្ជាប់ពាក្យ",
      "hand-cutting": "ពិធីកាត់ធៀបខ្ញុំ",
      birthday: "ពិធីកំណើត",
      anniversary: "ពិធីខួបនៃការរៀបការ",
      other: "ពិធីផ្សេងៗ",
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Statistics Cards & Event Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 md:gap-6">
        {/* Left Column: Statistics Cards */}
        <Card className="lg:col-span-5 p-0 space-y-3 md:space-y-4 border border-gray-200 shadow-none">
          <CardContent className="p-4 md:p-6">
            {/* Total Guests */}
            <Card className="border-none p-0 shadow-none">
              <CardContent className="p-4 md:p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl md:text-3xl font-bold text-gray-900">
                        {totalGuests}
                      </p>
                      <p className="text-sm text-gray-600 mt-0.5">ភ្ញៀវសរុប</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Separator className="my-4" />
            {/* Gifts Received */}
            <Card className="border-none p-0 shadow-none">
              <CardContent className="p-4 md:p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                      <Gift className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl md:text-3xl font-bold text-gray-900">
                        {giftCount}
                      </p>
                      <p className="text-sm text-gray-600 mt-0.5">បានចង់ដៃ</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Separator className="my-4" />

            {/* Pending & Percentage in 2-column grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Pending */}
              <Card className="border p-0 border-gray-200 shadow-none ">
                <CardContent className="p-4 flex gap-4">
                  <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center mb-3">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                  <p className="text-xl md:text-2xl font-bold text-gray-900">
                    {pendingGuests}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">នៅសល់</p>
                  </div>
                </CardContent>
              </Card>

              {/* Percentage */}
              <Card className="border p-0 border-gray-200 shadow-none">
                <CardContent className="p-4 flex gap-4">
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mb-3">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                  <p className="text-xl md:text-2xl font-bold text-gray-900">
                    {giftPercentage}%
                  </p>
                  <p className="text-xs text-gray-600 mt-1">ភាគរយ</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Event Details Section */}
        <div className="md:col-span-2 lg:col-span-7">
          <Card className="border p-0 border-gray-200 shadow-none h-full">
            <CardContent className="p-4 md:p-6">
              <CardTitle className="text-base md:text-lg font-semibold text-black mb-3 md:mb-4 flex items-center gap-2">
                <Calendar className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
                ព័ត៌មានលំអិតអំពីព្រឹត្តិការណ៍
              </CardTitle>

              <div className="space-y-3 md:space-y-4">
                {/* Event Type */}
                <div className="flex items-start gap-2 md:gap-3">
                  <div className="h-8 w-8 md:h-9 md:w-9 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Gift className="h-3.5 w-3.5 md:h-4 md:w-4 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] md:text-xs text-gray-500 mb-1">
                      ប្រភេទព្រឹត្តិការណ៍
                    </p>
                    <Badge variant="secondary" className="text-xs md:text-sm">
                      {getEventTypeLabel(event.eventType)}
                    </Badge>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="flex items-start gap-2 md:gap-3">
                  <div className="h-8 w-8 md:h-9 md:w-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] md:text-xs text-gray-500 mb-1">
                      កាលបរិច្ឆេទ & ពេលវេលា
                    </p>
                    <p className="text-xs md:text-sm font-medium text-gray-900">
                      {formattedDate}
                    </p>
                    {formattedTime && (
                      <p className="text-xs md:text-sm text-gray-600 mt-0.5">
                        {formattedTime}
                      </p>
                    )}
                  </div>
                </div>

                {/* Venue */}
                <div className="flex items-start gap-2 md:gap-3">
                  <div className="h-8 w-8 md:h-9 md:w-9 rounded-lg bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] md:text-xs text-gray-500 mb-1">ទីកន្លែង</p>
                    <p className="text-xs md:text-sm font-medium text-gray-900 wrap-break-word">
                      {event.venue}
                    </p>
                    {event.googleMapLink && (
                      <a
                        href={event.googleMapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] md:text-xs text-blue-600 hover:text-blue-700 mt-1.5 md:mt-2"
                      >
                        <ExternalLink className="h-2.5 w-2.5 md:h-3 md:w-3" />
                        មើលនៅលើផែនទី
                      </a>
                    )}
                  </div>
                </div>

                {/* Description */}
                {event.description && (
                  <div className="flex items-start gap-2 md:gap-3">
                    <div className="h-8 w-8 md:h-9 md:w-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                      <DollarSign className="h-3.5 w-3.5 md:h-4 md:w-4 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] md:text-xs text-gray-500 mb-1">ការពិពណ៌នា</p>
                      <p className="text-xs md:text-sm text-gray-700 leading-relaxed wrap-break-word">
                        {event.description}
                      </p>
                    </div>
                  </div>
                )}

                {/* Status Badge */}
                <div className="flex items-center gap-2 md:gap-3 pt-1 md:pt-2">
                  <div className="h-8 w-8 md:h-9 md:w-9 rounded-lg bg-yellow-100 flex items-center justify-center shrink-0">
                    <Clock className="h-3.5 w-3.5 md:h-4 md:w-4 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] md:text-xs text-gray-500 mb-1">ស្ថានភាព</p>
                    <Badge
                      variant={
                        event.status === "published" ? "default" : "secondary"
                      }
                      className="text-xs md:text-sm"
                    >
                      {event.status === "published" && "បានបោះពុម្ភផ្សាយ"}
                      {event.status === "draft" && "ព្រាង"}
                      {event.status === "completed" && "បានបញ្ចប់"}
                      {event.status === "cancelled" && "បានលុបចោល"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* QR Code & Recent Gifts Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        {/* Left Column: QR Code Payment Section */}
      {(event.khqrKhr || event.khqrUsd) && (
          <div
            className={
              giftCount > 0
                ? "lg:col-span-7 xl:col-span-8"
                : "lg:col-span-12"
            }
          >
            <h3 className="text-base md:text-lg font-semibold text-black mb-3 flex items-center gap-2">
              <QrCode className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
              QR Code សម្រាប់ទទួលប្រាក់ចំណងដៃ
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          {/* KHR QR Code */}
          {event.khqrKhr && (
                <Card className="border p-0 border-gray-200 shadow-none hover:shadow-md transition-shadow">
                  <CardContent className="p-3 md:p-4 lg:p-6">
                    <div className="flex items-center gap-2 mb-3 md:mb-4">
                      <div className="h-7 w-7 md:h-8 md:w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <QrCode className="h-3.5 w-3.5 md:h-4 md:w-4 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-sm md:text-base font-semibold text-black">
                    ស្កេនប្រាក់រៀល
                  </CardTitle>
                        <CardDescription className="text-xs hidden sm:block">
                          សម្រាប់ទទួលប្រាក់ជារូបិយប័ណ្ណរៀល
                        </CardDescription>
                      </div>
                </div>
                    <div className="flex flex-col items-center justify-center bg-linear-to-br from-blue-50 to-indigo-50 rounded-lg md:rounded-xl p-4 md:p-6 border border-blue-100">
                      <div className="w-48 h-48 sm:w-52 sm:h-52 md:w-56 md:h-56 lg:w-60 lg:h-60 bg-white rounded-lg md:rounded-xl shadow-lg flex items-center justify-center border-2 border-blue-200 relative overflow-hidden">
                    <ImageZoom className="relative w-full h-full">
                      <Image
                        src={event.khqrKhr}
                        alt="KHQR KHR"
                            width={256}
                            height={256}
                        className="object-cover w-full h-full"
                        unoptimized
                      />
                    </ImageZoom>
                  </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-3 md:mt-4 text-xs md:text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        asChild
                      >
                        <a href={event.khqrKhr} download>
                          <Download className="h-3 w-3 md:h-4 md:w-4 mr-1.5 md:mr-2" />
                    ទាញយក QR Code
                  </a>
                      </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* USD QR Code */}
          {event.khqrUsd && (
                <Card className="border p-0 border-gray-200 shadow-none hover:shadow-md transition-shadow">
                  <CardContent className="p-3 md:p-4 lg:p-6">
                    <div className="flex items-center gap-2 mb-3 md:mb-4">
                      <div className="h-7 w-7 md:h-8 md:w-8 rounded-lg bg-green-100 flex items-center justify-center">
                        <QrCode className="h-3.5 w-3.5 md:h-4 md:w-4 text-green-600" />
                      </div>
                      <div>
                        <CardTitle className="text-sm md:text-base font-semibold text-black">
                    ស្កេនប្រាក់ដុល្លារ
                  </CardTitle>
                        <CardDescription className="text-xs hidden sm:block">
                          សម្រាប់ទទួលប្រាក់ជារូបិយប័ណ្ណដុល្លារ
                        </CardDescription>
                      </div>
                </div>
                    <div className="flex flex-col items-center justify-center bg-linear-to-br from-green-50 to-emerald-50 rounded-lg md:rounded-xl p-4 md:p-6 border border-green-100">
                      <div className="w-48 h-48 sm:w-52 sm:h-52 md:w-56 md:h-56 lg:w-60 lg:h-60 bg-white rounded-lg md:rounded-xl shadow-lg flex items-center justify-center border-2 border-green-200 relative overflow-hidden">
                    <ImageZoom className="relative w-full h-full">
                      <Image
                        src={event.khqrUsd}
                        alt="KHQR USD"
                            width={256}
                            height={256}
                        className="object-cover w-full h-full"
                        unoptimized
                      />
                    </ImageZoom>
                  </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-3 md:mt-4 text-xs md:text-sm text-green-600 hover:text-green-700 hover:bg-green-50"
                        asChild
                      >
                        <a href={event.khqrUsd} download>
                          <Download className="h-3 w-3 md:h-4 md:w-4 mr-1.5 md:mr-2" />
                    ទាញយក QR Code
                  </a>
                      </Button>
                </div>
              </CardContent>
            </Card>
          )}
            </div>
        </div>
      )}

        {/* Right Column: Recent Gifts/Donations Section */}
        {giftCount > 0 ? (
          <div
            className={`${
              event.khqrKhr || event.khqrUsd
                ? "lg:col-span-5 xl:col-span-4"
                : "lg:col-span-12"
            }`}
          >
            <h3 className="text-base md:text-lg font-semibold text-black mb-3 flex items-center gap-2">
              <Gift className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
              ចំណងដៃថ្មីៗ
            </h3>
            <Card className="border p-0 border-gray-200 shadow-none h-full">
              <CardContent className="p-3 md:p-4 lg:p-6">
                <div className="space-y-2 max-h-[400px] sm:max-h-[450px] md:max-h-[500px] lg:max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
                  {guestsWithGifts.slice(0, 10).map((guest) => {
                const initial = guest.name.charAt(0).toUpperCase();
                    let createdAt: string;
                    try {
                      createdAt = format(
                        new Date(guest.createdAt),
                        "d MMM yyyy, h:mm a",
                        { locale: km }
                      );
                    } catch {
                      createdAt = "មិនមានកាលបរិច្ឆេទ";
                    }

                return (
                  <div
                    key={guest.id}
                        className="flex items-center justify-between p-2.5 md:p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                      >
                        <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                          <div className="h-9 w-9 md:h-10 md:w-10 lg:h-11 lg:w-11 bg-linear-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center shrink-0 border-2 border-white shadow-sm">
                            <span className="text-xs md:text-sm font-bold text-indigo-600">
                          {initial}
                        </span>
                      </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs md:text-sm font-semibold text-black truncate">
                          {guest.name}
                        </p>
                            <p className="text-[10px] md:text-xs text-gray-500 truncate">
                              {createdAt}
                            </p>
                      </div>
                    </div>
                        <Badge
                          variant="outline"
                          className="text-[10px] md:text-xs shrink-0 bg-green-50 text-green-700 border-green-200 px-1.5 md:px-2"
                        >
                          ✓ <span className="hidden sm:inline">បានចង់ដៃ</span>
                      </Badge>
                  </div>
                );
              })}
            </div>

                {guestsWithGifts.length > 10 && (
                  <p className="text-[10px] md:text-xs text-gray-500 text-center mt-3 md:mt-4">
                    និងមានអ្នកផ្សេងទៀត {guestsWithGifts.length - 10} នាក់...
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        ) : !event.khqrKhr && !event.khqrUsd ? (
          // Empty state when no gifts yet and no QR codes
          <div className="lg:col-span-12">
            <Card className="border border-dashed border-gray-300 shadow-none">
              <CardContent className="p-6 md:p-8 lg:p-12 text-center">
                <div className="h-12 w-12 md:h-14 md:w-14 lg:h-16 lg:w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <Gift className="h-6 w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 text-gray-400" />
                </div>
                <CardTitle className="text-base md:text-lg font-semibold text-gray-900 mb-1.5 md:mb-2">
                  មិនទាន់មានចំណងដៃ
                </CardTitle>
                <CardDescription className="text-xs md:text-sm text-gray-600">
                  នៅពេលភ្ញៀវចង់ដៃ ព័ត៌មានរបស់ពួកគេនឹងបង្ហាញនៅទីនេះ
                </CardDescription>
          </CardContent>
        </Card>
          </div>
        ) : null}
      </div>
    </div>
  );
}
