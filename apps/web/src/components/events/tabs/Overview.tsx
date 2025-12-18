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
    <div className="space-y-6">
      {/* Statistics Cards & Event Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Statistics Cards */}
        <Card className="lg:col-span-5 p-0 border border-gray-200 shadow-none">
          <CardContent className="p-6 space-y-0">
            {/* Total Guests */}
            <div className="flex items-center gap-3 pb-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{totalGuests}</p>
                <p className="text-sm text-gray-600">ភ្ញៀវសរុប</p>
              </div>
            </div>
            <Separator />
            
            {/* Gifts Received */}
            <div className="flex items-center gap-3 py-4">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <Gift className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{giftCount}</p>
                <p className="text-sm text-gray-600">បានចង់ដៃ</p>
              </div>
            </div>
            <Separator />

            {/* Pending & Percentage in 2-column grid */}
            <div className="grid grid-cols-2 gap-3 pt-4">
              {/* Pending */}
              <Card className="border border-gray-200 p-0 shadow-none">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                      <Clock className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-2xl font-bold text-gray-900">{pendingGuests}</p>
                      <p className="text-xs text-gray-600">នៅសល់</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Percentage */}
              <Card className="border border-gray-200 p-0 shadow-none">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-2xl font-bold text-gray-900">{giftPercentage}%</p>
                      <p className="text-xs text-gray-600">ភាគរយ</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Event Details Section */}
        <div className="lg:col-span-7">
          <Card className="border p-0 border-gray-200 shadow-none h-full">
            <CardContent className="p-6">
              <CardTitle className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-600" />
                ព័ត៌មានលំអិតអំពីព្រឹត្តិការណ៍
              </CardTitle>

              <div className="space-y-4">
                {/* Event Type */}
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Gift className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-1">ប្រភេទព្រឹត្តិការណ៍</p>
                    <Badge variant="secondary" className="text-sm">
                      {getEventTypeLabel(event.eventType)}
                    </Badge>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-1">កាលបរិច្ឆេទ & ពេលវេលា</p>
                    <p className="text-sm font-medium text-gray-900">{formattedDate}</p>
                    {formattedTime && (
                      <p className="text-sm text-gray-600 mt-0.5">{formattedTime}</p>
                    )}
                  </div>
                </div>

                {/* Venue */}
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-1">ទីកន្លែង</p>
                    <p className="text-sm font-medium text-gray-900 wrap-break-word">
                      {event.venue}
                    </p>
                    {event.googleMapLink && (
                      <a
                        href={event.googleMapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 mt-2"
                      >
                        <ExternalLink className="h-3 w-3" />
                        មើលនៅលើផែនទី
                      </a>
                    )}
                  </div>
                </div>

                {/* Description */}
                {event.description && (
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                      <DollarSign className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 mb-1">ការពិពណ៌នា</p>
                      <p className="text-sm text-gray-700 leading-relaxed wrap-break-word">
                        {event.description}
                      </p>
                    </div>
                  </div>
                )}

                {/* Status Badge */}
                <div className="flex items-center gap-3 pt-2">
                  <div className="h-9 w-9 rounded-lg bg-yellow-100 flex items-center justify-center shrink-0">
                    <Clock className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">ស្ថានភាព</p>
                    <Badge
                      variant={event.status === "published" ? "default" : "secondary"}
                      className="text-sm"
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

      {/* QR Code Section */}
      {(event.khqrKhr || event.khqrUsd) && (
        <div>
          <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
            <QrCode className="h-5 w-5 text-gray-600" />
            QR Code សម្រាប់ទទួលប្រាក់ចំណងដៃ
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* KHR QR Code */}
            {event.khqrKhr && (
              <Card className="border border-gray-200 shadow-none hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <QrCode className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold text-black">
                        ស្កេនប្រាក់រៀល
                      </CardTitle>
                      <CardDescription className="text-xs hidden sm:block">
                        សម្រាប់ទទួលប្រាក់ជារូបិយប័ណ្ណរៀល
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center bg-linear-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                    <div className="w-56 h-56 sm:w-60 sm:h-60 bg-white rounded-xl shadow-lg flex items-center justify-center border-2 border-blue-200 relative overflow-hidden">
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
                      className="mt-4 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      asChild
                    >
                      <a href={event.khqrKhr} download>
                        <Download className="h-4 w-4 mr-2" />
                        ទាញយក QR Code
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* USD QR Code */}
            {event.khqrUsd && (
              <Card className="border border-gray-200 shadow-none hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                      <QrCode className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold text-black">
                        ស្កេនប្រាក់ដុល្លារ
                      </CardTitle>
                      <CardDescription className="text-xs hidden sm:block">
                        សម្រាប់ទទួលប្រាក់ជារូបិយប័ណ្ណដុល្លារ
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center bg-linear-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                    <div className="w-56 h-56 sm:w-60 sm:h-60 bg-white rounded-xl shadow-lg flex items-center justify-center border-2 border-green-200 relative overflow-hidden">
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
                      className="mt-4 text-sm text-green-600 hover:text-green-700 hover:bg-green-50"
                      asChild
                    >
                      <a href={event.khqrUsd} download>
                        <Download className="h-4 w-4 mr-2" />
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
    </div>
  );
}
