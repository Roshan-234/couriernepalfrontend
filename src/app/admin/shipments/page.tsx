import ShipmentTable from '@/components/admin/ShipmentTable';

export default function ShipmentManagementPage() {
  // Mock data
  const shipments = Array.from({ length: 15 }).map((_, index) => ({
    id: `CN12345678${index}`,
    sender: `Sender ${index + 1}`,
    receiver: `Receiver ${index + 1}`,
    origin: 'Kathmandu',
    destination: 'Pokhara',
    status: index % 3 === 0 ? 'Delivered' : index % 3 === 1 ? 'In Transit' : 'Processing',
    date: `Oct ${15 + index}, 2023`
  }));

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Shipment Management</h1>
        <button className="bg-blue-900 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-lg">
          Create Shipment
        </button>
      </div>
      <ShipmentTable shipments={shipments} />
    </div>
  );
}