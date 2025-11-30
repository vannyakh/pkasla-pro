interface ModernMinimalTemplateProps {
  event: {
    title: string;
    description?: string;
    date: string | Date;
    venue: string;
    googleMapLink?: string;
    coverImage?: string;
  };
  guest: {
    name: string;
    email?: string;
    meta?: Record<string, string>;
  };
  assets: {
    images?: Record<string, string>;
    colors?: Record<string, string>;
    fonts?: Record<string, string>;
  };
}

export default function ModernMinimalTemplate({ event, guest, assets }: ModernMinimalTemplateProps) {
  const eventDate = typeof event.date === 'string' ? new Date(event.date) : event.date;
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = eventDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  const primaryColor = assets.colors?.primary || '#000000';
  const accentColor = assets.colors?.accent || '#666666';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-lg w-full bg-white shadow-lg">
        {/* Header with line */}
        <div className="border-b-2 border-black py-12 px-8">
          <h1 className="text-4xl md:text-5xl font-light tracking-tight" style={{ color: primaryColor }}>
            {event.title}
          </h1>
        </div>

        {/* Content */}
        <div className="px-8 py-12 space-y-8">
          {/* Greeting */}
          <div>
            <p className="text-lg text-gray-700 mb-4">Dear {guest.name},</p>
            {event.description && (
              <p className="text-gray-600 leading-relaxed">{event.description}</p>
            )}
          </div>

          {/* Event Details */}
          <div className="space-y-6 pt-6 border-t border-gray-200">
            <div>
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: accentColor }}>
                Date & Time
              </p>
              <p className="text-xl font-light">{formattedDate}</p>
              <p className="text-lg font-light text-gray-600">{formattedTime}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: accentColor }}>
                Location
              </p>
              <p className="text-lg font-light">{event.venue}</p>
              {event.googleMapLink && (
                <a
                  href={event.googleMapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm mt-2 inline-block underline"
                  style={{ color: primaryColor }}
                >
                  Get Directions
                </a>
              )}
            </div>
          </div>

          {/* RSVP */}
          <div className="pt-8">
            <a
              href={`/invite/${(guest as any).inviteToken || ''}/rsvp`}
              className="inline-block w-full text-center py-3 border-2 font-light tracking-wide transition-all hover:bg-black hover:text-white"
              style={{ borderColor: primaryColor, color: primaryColor }}
            >
              RSVP
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-8 py-6 text-center text-sm text-gray-500">
          <p>We hope to see you there</p>
        </div>
      </div>
    </div>
  );
}

