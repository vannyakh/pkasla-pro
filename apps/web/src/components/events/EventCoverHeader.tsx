"use client";

import Image from "next/image";
import {
  Calendar,
  Users,
  MapPin,
  Settings as SettingsIcon,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TextGenerateEffect } from "@/components/ui/shadcn-io/text-generate-effect";
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
    <div className="grid grid-cols-3 gap-4 rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white">
      {/* Cover Image - 2 columns */}
      <div className="col-span-3 lg:col-span-2 relative h-[300px] lg:h-auto min-h-[300px] overflow-hidden">
        {event.coverImage && (
          <Image
            src={event.coverImage}
            alt={event.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 66vw"
          />
        )}
        {/* Overlays background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/0 to-black/60 z-0" />
        {/* Card for event title and status */}
        <Card className="shadow-none border-none bg-transparent z-10 relative w-full h-full flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2 sm:gap-4 px-3 sm:px-4 py-3 sm:py-4">
            <div className="flex-1 space-y-2 min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <TextGenerateEffect
                  words={event.title}
                  className="text-xl sm:text-2xl md:text-3xl font-bold text-white drop-shadow-lg"
                  filter={true}
                  duration={0.4}
                  staggerDelay={0.08}
                />
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

          {/* Description with divider */}
          {event.description && (
            <div className="px-3 sm:px-4 pb-3 sm:pb-4">
              <div className="border-t border-white/20 mb-3 sm:mb-4"></div>
              <div className="w-full overflow-hidden relative">
                <div 
                  className="inline-block whitespace-nowrap"
                  style={{ animation: 'marquee-scroll 25s linear infinite' }}
                >
                  <TextGenerateEffect
                    words={event.description}
                    className="text-xs sm:text-sm md:text-base text-white/95 drop-shadow-md inline-block pr-8"
                    filter={false}
                    duration={0.3}
                    staggerDelay={0.05}
                  />
                  <TextGenerateEffect
                    words={event.description}
                    className="text-xs sm:text-sm md:text-base text-white/95 drop-shadow-md inline-block pr-8"
                    filter={false}
                    duration={0.3}
                    staggerDelay={0.05}
                  />
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Content Info - 1 column */}
      <div className="col-span-3 lg:col-span-1 p-3 sm:p-4 space-y-3 sm:space-y-4">
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:bg-gray-100 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-gray-600" />
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              កាលបរិច្ឆេទ
            </p>
          </div>
          <p className="text-base font-bold text-gray-900">
            {formatDate(
              typeof event.date === "string" ? event.date : event.date
            )}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:bg-gray-100 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-4 w-4 text-gray-600" />
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              ទីតាំង
            </p>
          </div>
          <p className="text-base font-bold text-gray-900">{event.venue}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:bg-gray-100 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-gray-600" />
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              ភ្ញៀវ
            </p>
          </div>
          <p className="text-base font-bold text-gray-900">
            {event.guestCount} នាក់
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:bg-gray-100 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-gray-600" />
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              បានបង្កើត
            </p>
          </div>
          <p className="text-base font-bold text-gray-900">
            {formatDateTime(
              typeof event.createdAt === "string"
                ? event.createdAt
                : event.createdAt
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
