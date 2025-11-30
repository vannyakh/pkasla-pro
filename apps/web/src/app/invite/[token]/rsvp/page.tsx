'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/axios-client';
import toast from 'react-hot-toast';

type RSVPStatus = 'pending' | 'confirmed' | 'declined';

export default function RSVPPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;
  const [status, setStatus] = useState<RSVPStatus>('pending');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsSubmitting(true);
    try {
      const response = await api.post(`/invites/${token}/rsvp`, {
        status,
        message: message.trim() || undefined,
      });

      if (response.success) {
        toast.success('RSVP submitted successfully!');
        // Optionally redirect or show confirmation
        setTimeout(() => {
          router.push(`/invite/${token}`);
        }, 1500);
      } else {
        toast.error(response.error || 'Failed to submit RSVP');
      }
    } catch (error: any) {
      toast.error(error?.error || 'Failed to submit RSVP');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            RSVP to Event
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please let us know if you can attend
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Will you be attending?
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value="confirmed"
                    checked={status === 'confirmed'}
                    onChange={(e) => setStatus(e.target.value as RSVPStatus)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Yes, I&apos;ll be there</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value="declined"
                    checked={status === 'declined'}
                    onChange={(e) => setStatus(e.target.value as RSVPStatus)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Sorry, I can&apos;t make it</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value="pending"
                    checked={status === 'pending'}
                    onChange={(e) => setStatus(e.target.value as RSVPStatus)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Not sure yet</span>
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message (optional)
              </label>
              <textarea
                id="message"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Add a personal message..."
                maxLength={1000}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit RSVP'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

