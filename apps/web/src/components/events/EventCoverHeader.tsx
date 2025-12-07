"use client";

import {
  Calendar,
  Users,
  MapPin,
  Settings as SettingsIcon,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Marquee,
  MarqueeContent,
  MarqueeItem,
} from "@/components/ui/shadcn-io/marquee";
import type { Event, EventStatus, UpdateEventDto } from "@/types/event";
import {
  getEventStatusColor,
  getEventStatusLabel,
  formatDate,
  formatDateTime,
} from "@/helpers";
import type { UseMutationResult } from "@tanstack/react-query";

interface EventCoverHeaderProps {
  event: Event;
  onUpdateStatus: (status: EventStatus) => Promise<void>;
  updateEventMutation: UseMutationResult<
    Event,
    Error,
    {
      id: string;
      data: UpdateEventDto;
      files?: { coverImage?: File; khqrUsd?: File; khqrKhr?: File };
    },
    unknown
  >;
}

export function EventCoverHeader({
  event,
  onUpdateStatus,
  updateEventMutation,
}: EventCoverHeaderProps) {
  return (
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
              <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-white drop-shadow-lg wrap-break-word">
                {event.title}
              </CardTitle>
              <Badge
                variant={getEventStatusColor(event.status)}
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
                  : `ស្ថានភាព: ${getEventStatusLabel(event.status)}`}
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
                      onUpdateStatus(status);
                    }
                  }}
                  disabled={
                    event.status === status || updateEventMutation.isPending
                  }
                  className={
                    event.status === status ? "bg-gray-100" : "cursor-pointer"
                  }
                >
                  <span className="flex-1">{getEventStatusLabel(status)}</span>
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
                  typeof event.date === "string" ? event.date : event.date
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
                    : event.createdAt
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Description with divider */}
        {event.description && (
          <div className="px-3  w-full max-w-full overflow-hidden sm:px-4">
            <div className="border-t border-white/20 mb-3 sm:mb-4"></div>
            <div className="w-full max-w-full overflow-hidden">
            <Marquee className="w-full max-w-full overflow-hidden">
              <MarqueeContent speed={30} pauseOnHover>
                <MarqueeItem className="px-4">
                  <p className="text-xs sm:text-sm md:text-base text-white/95 drop-shadow-md whitespace-nowrap">
                    {event.description}
                  </p>
                </MarqueeItem>
              </MarqueeContent>
            </Marquee>
            </div>
    
          </div>
        )}
      </Card>
    </div>
  );
}
