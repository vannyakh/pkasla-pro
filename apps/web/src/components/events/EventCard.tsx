"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Settings,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Calendar,
  Users,
  MoreVertical,
  Share2,
  Copy,
  QrCode,
  Globe,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CountdownTimer from "@/components/CountdownTimer";
import { Event } from "@/types/event";
import { formatDate, formatTime, formatDateTime } from "@/helpers/format";
import { getEventStatusColor } from "@/helpers/event";
import { TextGenerateEffect } from "@/components/ui/shadcn-io/text-generate-effect";

interface EventCardProps {
  event: Event;
  onShare: () => void;
  onDuplicate: () => void;
  onToggleStatus: () => void;
  onViewQR: () => void;
  onViewPublic: () => void;
  onDelete: () => void;
  onManage: () => void;
  isDeleting?: boolean;
  isUpdating?: boolean;
  priority?: boolean;
}

const DEFAULT_EVENT_IMAGE =
  "https://images.unsplash.com/photo-1519162808019-7de1683fa2ad?w=800&q=80";

export const EventCard = React.memo(function EventCard({
  event,
  onShare,
  onDuplicate,
  onToggleStatus,
  onViewQR,
  onViewPublic,
  onDelete,
  onManage,
  isDeleting = false,
  isUpdating = false,
  priority = false,
}: EventCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textRef = useRef<HTMLHeadingElement>(null);

  // Memoize computed values
  const eventImage = useMemo(
    () => event.coverImage || DEFAULT_EVENT_IMAGE,
    [event.coverImage]
  );

  const eventDate = useMemo(() => {
    return typeof event.date === "string"
      ? event.date
      : event.date.toISOString();
  }, [event.date]);

  const formattedDate = useMemo(() => formatDate(event.date), [event.date]);
  const formattedTime = useMemo(() => formatTime(event.date), [event.date]);
  const formattedCreatedAt = useMemo(
    () => formatDateTime(event.createdAt),
    [event.createdAt]
  );
  const statusColor = useMemo(
    () => getEventStatusColor(event.status),
    [event.status]
  );

  // Check if text is overflowing
  useEffect(() => {
    const checkOverflow = () => {
      if (textRef.current) {
        const isOverflow = textRef.current.scrollWidth > textRef.current.clientWidth;
        setIsOverflowing(isOverflow);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [event.description, event.title]);

  return (
    <Card className="relative overflow-hidden p-0 gap-0 border-0">
      {/* Background Image */}
      <div className="relative h-64 w-full overflow-hidden">
        <Image
          src={eventImage}
          alt={event.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
          priority={priority}
        />
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/80 z-10" />

        {/* Countdown Timer and Event Title - Centered Column */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 w-full px-4">
          <div className="flex flex-col items-center gap-4">
            {/* Countdown Timer */}
            <div className="w-full flex justify-center">
              <CountdownTimer targetDate={eventDate} variant="relative" />
            </div>

            {/* Event Title */}
            <div className="text-center">
              <TextGenerateEffect
                words={event.title}
                className="text-white text-lg font-semibold mb-1 drop-shadow-lg"
                filter={true}
                duration={0.4}
                staggerDelay={0.08}
              />
              <p className="text-white/90 text-xs drop-shadow">
                {formattedDate} at {formattedTime}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="p-4 bg-white">
        <div className="mb-3">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex-1 overflow-hidden relative">
              <h4 
                ref={textRef}
                className={`text-sm font-semibold text-black whitespace-nowrap ${
                  isOverflowing 
                    ? 'inline-block' 
                    : 'truncate'
                }`}
                style={isOverflowing ? {
                  paddingRight: '2rem',
                  animation: 'marquee-scroll 25s linear infinite'
                } : undefined}
              >
                {event.description || event.title}
                {isOverflowing && <span className="ml-8">{event.description || event.title}</span>}
              </h4>
            </div>
            <Badge
              variant={statusColor}
              className="text-xs shrink-0 capitalize"
            >
              {event.status}
            </Badge>
          </div>
          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{event.venue}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="h-3 w-3" />
              <span>ចំនួនភ្ញៀវ {event.guestCount} នាក់</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3 w-3" />
              <span>Created: {formattedCreatedAt}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/events/${event.id}`} className="flex-1">
            <Button
              variant="outline"
              className="w-full text-xs h-8 border-gray-300 hover:bg-gray-50"
              size="sm"
            >
              <Eye className="h-3.5 w-3.5 mr-1.5" />
              View
            </Button>
          </Link>
          <Link href={`/dashboard/events/${event.id}/edit`} className="flex-1">
            <Button
              variant="outline"
              className="w-full text-xs h-8 border-gray-300 hover:bg-gray-50"
              size="sm"
            >
              <Edit className="h-3.5 w-3.5 mr-1.5" />
              Edit
            </Button>
          </Link>
          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="text-xs h-8 border-gray-300 hover:bg-gray-50 px-2"
                size="sm"
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 rounded-xl shadow-lg border-gray-200 dark:border-gray-800 p-2"
            >
              {/* Quick Actions */}
              <DropdownMenuItem
                onClick={onShare}
                className="cursor-pointer rounded-lg px-3 py-2.5 my-0.5"
              >
                <Share2 className="h-4 w-4 mr-2" />
                <span>Share Event</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onViewQR}
                className="cursor-pointer rounded-lg px-3 py-2.5 my-0.5"
              >
                <QrCode className="h-4 w-4 mr-2" />
                <span>View QR Code</span>
              </DropdownMenuItem>
              {event.status === "published" && (
                <DropdownMenuItem
                  onClick={onViewPublic}
                  className="cursor-pointer rounded-lg px-3 py-2.5 my-0.5"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  <span>View Public Page</span>
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator className="my-2" />

              {/* Event Management */}
              <DropdownMenuItem
                onClick={onManage}
                className="cursor-pointer rounded-lg px-3 py-2.5 my-0.5"
              >
                <Settings className="h-4 w-4 mr-2" />
                <span>Manage Event</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onDuplicate}
                className="cursor-pointer rounded-lg px-3 py-2.5 my-0.5"
              >
                <Copy className="h-4 w-4 mr-2" />
                <span>Duplicate Event</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onToggleStatus}
                className="cursor-pointer rounded-lg px-3 py-2.5 my-0.5"
                disabled={isUpdating}
              >
                <FileText className="h-4 w-4 mr-2" />
                <span>
                  {isUpdating
                    ? "Updating..."
                    : event.status === "published"
                      ? "Move to Draft"
                      : "Publish Event"}
                </span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-2" />

              {/* Danger Zone */}
              <DropdownMenuItem
                onClick={() => {
                  onDelete();
                  setIsMenuOpen(false);
                }}
                className="cursor-pointer rounded-lg px-3 py-2.5 my-0.5 text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20"
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                <span>Delete Event</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
});
