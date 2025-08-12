import { Metadata } from 'next';
import TrackingInput from '@/components/tracking/TrackingInput';
import TrackingResult from '@/components/tracking/TrackingResult';

export const metadata: Metadata = {
  title: 'Track Your Shipment | Courier Nepal',
  description: 'Track your shipment in real-time. Get instant updates on your package location and estimated delivery time.',
};

export default function TrackingPage() {
  return (
    <div>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary-600 to-primary-700 text-white py-20">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:16px]" />
        <div className="relative container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Track Your Shipment</h1>
          <p className="text-xl max-w-3xl mx-auto text-primary-100">
            Enter your tracking number to get real-time updates on your shipment
          </p>
        </div>
      </div>

      {/* Tracking Input */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <TrackingInput />
        </div>
      </div>

      {/* Tracking Result */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <TrackingResult />
        </div>
      </div>
    </div>
  );
}