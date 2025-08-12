import ShipmentList from '@/components/dashboard/ShipmentList';
import Link from 'next/link';

export default function ShipmentsPage() {
  // Mock data
  const shipments = Array.from({ length: 15 }).map((_, index) => ({
    id: `CN12345678${index}`,
    sender: 'John Doe',
    receiver: 'Jane Smith',
    origin: 'Kathmandu',
    destination: 'Pokhara',
    status: index % 3 === 0 ? 'Delivered' : index % 3 === 1 ? 'In Transit' : 'Processing',
    date: `Oct ${15 + index}, 2023`
  }));

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">My Shipments</h1>
        <Link 
          href="/dashboard/create-shipment" 
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg"
        >
          Create New Shipment
        </Link>
      </div>
      <ShipmentList shipments={shipments} />
    </div>
  );
}