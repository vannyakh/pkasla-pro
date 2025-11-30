interface ClassicGoldTemplateProps {
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

export default function ClassicGoldTemplate({ event, guest, assets }: ClassicGoldTemplateProps) {
  const eventDate = typeof event.date === 'string' ? new Date(event.date) : event.date;
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const primaryColor = assets.colors?.primary || '#D4AF37';
  const secondaryColor = assets.colors?.secondary || '#1a1a1a';
  const backgroundImage = assets.images?.background || event.coverImage || '';

  return (
    <div
      className="min-h-screen flex items-center justify-center p-8"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="max-w-2xl w-full bg-white/95 backdrop-blur-sm rounded-lg shadow-2xl p-8 md:p-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="inline-block px-6 py-2 mb-4"
            style={{ backgroundColor: primaryColor, color: 'white' }}
          >
            <h1 className="text-3xl md:text-4xl font-serif font-bold">{event.title}</h1>
          </div>
        </div>

        {/* Greeting */}
        <div className="text-center mb-8">
          <p className="text-lg md:text-xl text-gray-700 mb-2">Dear {guest.name},</p>
          <p className="text-base md:text-lg text-gray-600">
            {event.description || 'You are cordially invited to join us for a special celebration.'}
          </p>
        </div>

        {/* Event Details */}
        <div className="border-t-2 border-b-2 py-6 my-8" style={{ borderColor: primaryColor }}>
          <div className="space-y-4 text-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider mb-1" style={{ color: primaryColor }}>
                Date
              </p>
              <p className="text-xl font-serif">{formattedDate}</p>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider mb-1" style={{ color: primaryColor }}>
                Venue
              </p>
              <p className="text-lg">{event.venue}</p>
              {event.googleMapLink && (
                <a
                  href={event.googleMapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm mt-2 inline-block underline"
                  style={{ color: primaryColor }}
                >
                  View on Map
                </a>
              )}
            </div>
          </div>
        </div>

        {/* RSVP Button */}
        <div className="text-center mt-8">
          <a
            href={`/invite/${(guest as any).inviteToken || ''}/rsvp`}
            className="inline-block px-8 py-3 text-white font-semibold rounded-lg transition-all hover:opacity-90"
            style={{ backgroundColor: primaryColor }}
          >
            RSVP
          </a>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>We look forward to celebrating with you!</p>
        </div>
      </div>
    </div>
  );
}

