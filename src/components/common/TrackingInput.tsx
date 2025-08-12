"use client";

import { useState } from 'react';
import { useQuery } from 'react-query';
import api from '@/lib/api';

const TrackingInput = () => {
  const [trackingId, setTrackingId] = useState('');
  const [isTracking, setIsTracking] = useState(false);

  const { data: shipment, refetch, isLoading } = useQuery(
    ['tracking', trackingId],
    () => api.get(`/tracking/${trackingId}`).then(res => res.data),
    {
      enabled: false,
      retry: false,
    }
  );

  const handleTrack = () => {
    if (trackingId) {
      setIsTracking(true);
      refetch();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex mb-4">
        <input
          type="text"
          value={trackingId}
          onChange={(e) => setTrackingId(e.target.value)}
          placeholder="Enter tracking number"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleTrack}
          className="bg-blue-600 text-white px-6 py-2 rounded-r hover:bg-blue-700"
        >
          Track
        </button>
      </div>

      {isTracking && isLoading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      )}

      {shipment && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">Shipment Details</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`font-semibold ${
                shipment.status === 'Delivered' ? 'text-green-600' : 
                shipment.status === 'In Transit' ? 'text-blue-600' : 'text-yellow-600'
              }`}>
                {shipment.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">From:</span>
              <span>{shipment.origin}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">To:</span>
              <span>{shipment.destination}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Estimated Delivery:</span>
              <span>{shipment.estimatedDelivery}</span>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="font-medium mb-2">Tracking History</h4>
            <div className="space-y-2">
              {shipment.history.map((event: any, index: number) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  </div>
                  <div className="ml-3">
                    <p className="font-medium">{event.status}</p>
                    <p className="text-sm text-gray-500">{event.location} • {event.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackingInput;