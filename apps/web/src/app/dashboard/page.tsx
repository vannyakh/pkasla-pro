'use client'

import { motion } from 'framer-motion'
import { Calendar, Users, Sparkles, ArrowRight, Clock, MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useMe } from '@/hooks/api/useAuth'
import { useMyEvents } from '@/hooks/api/useEvent'
import { AppleHelloEnglishEffect } from '@/components/ui/shadcn-io/apple-hello-effect'
import { format } from 'date-fns'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import PageLoading from '@/components/PageLoading'

export default function DashboardPage() {
  const { data: user, isLoading: userLoading } = useMe()
  const { data: events = [], isLoading: eventsLoading } = useMyEvents()

  const isLoading = userLoading || eventsLoading

  // Calculate statistics
  const totalEvents = events.length
  const publishedEvents = events.filter(e => e.status === 'published').length
  const upcomingEvents = events
    .filter(e => {
      const eventDate = new Date(e.date)
      return eventDate >= new Date() && e.status === 'published'
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3)

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-center space-y-4">
          <PageLoading fullScreen={false} size="sm" text="Loading..." />
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="space-y-12 pb-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Welcome Section */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl to-muted/20 border border-border/50 shadow-sm"
      >
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}></div>
        </div>
        <div className="relative px-8 py-16 md:px-12 md:py-20">
          <div className="flex flex-col items-center text-center space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="text-foreground/60"
            >
              <AppleHelloEnglishEffect className="h-16 md:h-20" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-2"
            >
              <h1 className="text-4xl md:text-5xl font-light tracking-tight">
                {greeting()}, {user?.name?.split(' ')[0] || 'there'}
              </h1>
              <p className="text-lg text-muted-foreground font-light">
                Welcome back to your event dashboard
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <motion.div
          className="h-full"
        >
          <Card className="h-full border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Events
                </CardTitle>
                <div className="p-2 rounded-lg bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-light tracking-tight">{totalEvents}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {publishedEvents} published
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className="h-full"
        >
          <Card className="h-full border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Upcoming
                </CardTitle>
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Clock className="h-5 w-5 text-blue-500" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-light tracking-tight">
                {upcomingEvents.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Events coming soon
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className="h-full"
        >
          <Card className="h-full border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Templates
                </CardTitle>
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-light tracking-tight">
                {events.filter(e => e.templateSlug).length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                With custom templates
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-light tracking-tight">Upcoming Events</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Your events happening soon
              </p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/dashboard/events">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event, index) => {
              const eventDate = new Date(event.date)
              const isToday = format(eventDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.5 }}
                >
                  <Link href={`/dashboard/events/${event.id}`}>
                    <Card className="h-full p-0 border-border/50 shadow-sm cursor-pointer group">
                      {event.coverImage && (
                        <div className="relative h-48 overflow-hidden rounded-t-xl">
                          <Image
                            src={event.coverImage}
                            alt={event.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                          <div className="absolute bottom-4 left-4 right-4">
                            <h3 className="text-white font-medium text-lg line-clamp-1">
                              {event.title}
                            </h3>
                          </div>
                        </div>
                      )}
                      <CardContent className={event.coverImage ? "p-6" : "p-6"}>
                        {!event.coverImage && (
                          <h3 className="font-medium text-lg mb-4 line-clamp-1">
                            {event.title}
                          </h3>
                        )}
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">
                                {isToday ? 'Today' : format(eventDate, 'EEEE, MMM d')}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(eventDate, 'h:mm a')}
                              </p>
                            </div>
                          </div>
                          {event.venue && (
                            <div className="flex items-start gap-3">
                              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {event.venue}
                              </p>
                            </div>
                          )}
                          <div className="flex items-center gap-3 pt-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              {event.guestCount} {event.guestCount === 1 ? 'guest' : 'guests'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {!isLoading && totalEvents === 0 && (
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center justify-center py-16 px-6"
        >
          <div className="p-4 rounded-full bg-muted/50 mb-6">
            <Calendar className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-light mb-2">No events yet</h3>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            Start creating beautiful event invitations and manage your guests in one place.
          </p>
          <Button asChild>
            <Link href="/dashboard/events/new">
              Create your first event
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}
