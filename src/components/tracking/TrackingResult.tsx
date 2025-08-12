'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FaBox, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';
import { format } from 'date-fns';
import api from '@/lib/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export type TrackingEvent = {
  id: string;
  status: string;
  location: string;
  timestamp: string;
  note?: string;
};

export type TrackingResult = {
  id: string;
  status: string;
  origin: string;
  destination: string;
  created_at: string;
  estimated_delivery: string;
  events: TrackingEvent[];
};

export default function TrackingResult() {
  const searchParams = useSearchParams();
  const trackingId = searchParams.get('id');

  const { data: tracking, isLoading, isError, error, refetch } = useQuery<TrackingResult>({
    queryKey: ['tracking', trackingId],
    queryFn: async () => {
      const { data } = await api.get(`/api/tracking/${trackingId}`);
      return data;
    },
    enabled: !!trackingId,
  });

  useEffect(() => {
    if (trackingId) {
      refetch();
    }
  }, [trackingId, refetch]);

  if (!trackingId) return null;
  if (isLoading) return <LoadingSpinner />;
  if (isError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error: {(error as Error).message}</p>
      </div>
    );
  }
  if (!tracking) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6 md:p-8"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center mb-8">
        <div className="flex items-center justify-center w-16 h-16 bg-primary-100 rounded-xl">
          <FaBox className="w-8 h-8 text-primary-600" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Tracking ID: {tracking.id}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FaMapMarkerAlt className="text-primary-500" />
              <span>From: {tracking.origin}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FaMapMarkerAlt className="text-primary-500" />
              <span>To: {tracking.destination}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FaCalendarAlt className="text-primary-500" />
              <span>Created: {format(new Date(tracking.created_at), 'MMM dd, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FaCalendarAlt className="text-primary-500" />
              <span>Est. Delivery: {format(new Date(tracking.estimated_delivery), 'MMM dd, yyyy')}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <span className="px-3 py-1 rounded-full text-sm font-medium capitalize" style={{
            backgroundColor: 
              tracking.status === 'delivered' ? 'rgb(220 252 231)' :
              tracking.status === 'in_transit' ? 'rgb(219 234 254)' :
              'rgb(254 243 199)',
            color:
              tracking.status === 'delivered' ? 'rgb(22 163 74)' :
              tracking.status === 'in_transit' ? 'rgb(29 78 216)' :
              'rgb(202 138 4)'
          }}>
            {tracking.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-8">
        {tracking.events.map((event, index) => (
          <div key={event.id} className="relative">
            {index !== tracking.events.length - 1 && (
              <div className="absolute top-6 left-3 -bottom-10 w-0.5 bg-gray-200" />
            )}
            <div className="relative flex items-start group">
              <div className="flex items-center justify-center w-6 h-6 bg-primary-100 rounded-full ring-8 ring-white">
                <div className="w-2 h-2 bg-primary-600 rounded-full" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {event.status}
                </h3>
                <div className="mt-1 text-sm text-gray-500">
                  <span>{event.location}</span>
                  <span className="mx-2">•</span>
                  <time>{format(new Date(event.timestamp), 'MMM dd, yyyy HH:mm')}</time>
                </div>
                {event.note && (
                  <p className="mt-2 text-sm text-gray-600">{event.note}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
