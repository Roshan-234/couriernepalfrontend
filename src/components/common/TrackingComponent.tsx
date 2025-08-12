import { useState } from 'react';
import { FaSearch, FaBox, FaMapMarkerAlt, FaTruck, FaCheckCircle } from 'react-icons/fa';

interface TrackingEvent {
  status: string;
  location: string;
  description: string;
  timestamp: string;
}

interface ShipmentDetails {
  tracking_number: string;
  status: string;
  sender_name: string;
  sender_city: string;
  receiver_name: string;
  receiver_city: string;
  estimated_delivery: string;
  tracking_events: TrackingEvent[];
}

export default function TrackingComponent() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shipment, setShipment] = useState<ShipmentDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShipment(null);

    try {
      const res = await fetch(`/api/shipments/track/${trackingNumber}`);
      if (!res.ok) throw new Error('Shipment not found');
      const data = await res.json();
      setShipment(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <FaBox className="text-gray-500" />;
      case 'picked_up':
        return <FaTruck className="text-blue-500" />;
      case 'in_transit':
        return <FaMapMarkerAlt className="text-orange-500" />;
      case 'delivered':
        return <FaCheckCircle className="text-green-500" />;
      default:
        return <FaBox className="text-gray-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Track Your Shipment</h2>
        <form onSubmit={handleTrack} className="flex gap-4">
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Enter tracking number"
            className="flex-1 border rounded-lg px-4 py-2"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? (
              'Tracking...'
            ) : (
              <>
                <FaSearch className="inline mr-2" />
                Track
              </>
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 mb-8">
          {error}
        </div>
      )}

      {shipment && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="border-b pb-6 mb-6">
            <h3 className="text-xl font-bold mb-4">Shipment Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Tracking Number</p>
                <p className="font-semibold">{shipment.tracking_number}</p>
              </div>
              <div>
                <p className="text-gray-600">Status</p>
                <p className="font-semibold capitalize">{shipment.status}</p>
              </div>
              <div>
                <p className="text-gray-600">From</p>
                <p className="font-semibold">{shipment.sender_name}</p>
                <p className="text-sm text-gray-500">{shipment.sender_city}</p>
              </div>
              <div>
                <p className="text-gray-600">To</p>
                <p className="font-semibold">{shipment.receiver_name}</p>
                <p className="text-sm text-gray-500">{shipment.receiver_city}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Tracking History</h3>
            <div className="space-y-6">
              {shipment.tracking_events.map((event, index) => (
                <div key={index} className="flex gap-4">
                  <div className="mt-1">
                    {getStatusIcon(event.status)}
                  </div>
                  <div>
                    <p className="font-semibold capitalize">{event.status}</p>
                    <p className="text-gray-600">{event.location}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(event.timestamp).toLocaleString()}
                    </p>
                    {event.description && (
                      <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
