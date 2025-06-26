import TrackingInput from '@/components/common/TrackingInput';
import ShipmentStatus from '@/components/common/ShipmentStatus';

const TrackingPage = () => {
  // Mock tracking data
  const trackingData = [
    { status: 'Order Received', location: 'Kathmandu', timestamp: '2023-10-15 10:30 AM', completed: true },
    { status: 'In Transit', location: 'Kathmandu Hub', timestamp: '2023-10-15 2:15 PM', completed: true },
    { status: 'Departed Facility', location: 'Kathmandu', timestamp: '2023-10-16 9:00 AM', completed: true },
    { status: 'Arrived at Destination Hub', location: 'Pokhara', timestamp: '2023-10-16 3:45 PM', completed: true },
    { status: 'Out for Delivery', location: 'Pokhara', timestamp: '2023-10-17 8:30 AM', completed: false },
    { status: 'Delivered', location: 'Pokhara', timestamp: '', completed: false },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-blue-900 text-white py-20">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold mb-6">Track Your Shipment</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Enter your tracking number to get real-time updates on your shipment
          </p>
        </div>
      </div>

      {/* Tracking Input */}
      <div className="container mx-auto py-16">
        <div className="max-w-3xl mx-auto">
          <TrackingInput />
        </div>
      </div>

      {/* Tracking Result */}
      <div className="container mx-auto py-16">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
          <div className="flex items-center mb-8">
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
            <div className="ml-6">
              <h2 className="text-2xl font-bold">Tracking ID: CN123456789NP</h2>
              <div className="flex flex-wrap gap-4 mt-2">
                <div>
                  <span className="font-semibold">From:</span> Kathmandu
                </div>
                <div>
                  <span className="font-semibold">To:</span> Pokhara
                </div>
                <div>
                  <span className="font-semibold">Status:</span> In Transit
                </div>
                <div>
                  <span className="font-semibold">Est. Delivery:</span> Oct 17, 2023
                </div>
              </div>
            </div>
          </div>

          <ShipmentStatus steps={trackingData} />
        </div>
      </div>
    </div>
  );
};

export default TrackingPage;