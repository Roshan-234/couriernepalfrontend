import { FaBox, FaMapMarkerAlt, FaClock, FaMoneyBillWave, FaUser } from 'react-icons/fa';
import ShipmentStatus from '@/components/common/ShipmentStatus';
import InvoiceGenerator from '@/components/common/InvoiceGenerator';

export default function ShipmentDetailPage({ params }: { params: { id: string } }) {
  // Mock data
  const shipment = {
    id: params.id,
    sender: {
      name: 'John Doe',
      address: '123 Main St, Kathmandu, Nepal',
      phone: '+977 9841000000'
    },
    receiver: {
      name: 'Jane Smith',
      address: '456 Park Rd, Pokhara, Nepal',
      phone: '+977 9841111111'
    },
    details: {
      weight: '2.5 kg',
      dimensions: '30x20x15 cm',
      service: 'Standard Delivery',
      cost: 'Rs. 350'
    },
    tracking: [
      { status: 'Order Received', location: 'Kathmandu', timestamp: '2023-10-15 10:30 AM', completed: true },
      { status: 'In Transit', location: 'Kathmandu Hub', timestamp: '2023-10-15 2:15 PM', completed: true },
      { status: 'Departed Facility', location: 'Kathmandu', timestamp: '2023-10-16 9:00 AM', completed: true },
      { status: 'Arrived at Destination Hub', location: 'Pokhara', timestamp: '2023-10-16 3:45 PM', completed: true },
      { status: 'Out for Delivery', location: 'Pokhara', timestamp: '2023-10-17 8:30 AM', completed: false },
      { status: 'Delivered', location: 'Pokhara', timestamp: '', completed: false },
    ]
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Shipment Details</h1>
        <InvoiceGenerator shipment={shipment} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <FaBox className="mr-2 text-blue-600" />
            Shipment Information
          </h2>
          <div className="space-y-4">
            <div>
              <div className="text-gray-500 text-sm">Tracking ID</div>
              <div className="font-medium">{shipment.id}</div>
            </div>
            <div>
              <div className="text-gray-500 text-sm">Service Type</div>
              <div className="font-medium">{shipment.details.service}</div>
            </div>
            <div>
              <div className="text-gray-500 text-sm">Weight</div>
              <div className="font-medium">{shipment.details.weight}</div>
            </div>
            <div>
              <div className="text-gray-500 text-sm">Dimensions</div>
              <div className="font-medium">{shipment.details.dimensions}</div>
            </div>
            <div>
              <div className="text-gray-500 text-sm">Shipping Cost</div>
              <div className="font-medium">{shipment.details.cost}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <FaUser className="mr-2 text-blue-600" />
            Sender Information
          </h2>
          <div className="space-y-4">
            <div>
              <div className="text-gray-500 text-sm">Name</div>
              <div className="font-medium">{shipment.sender.name}</div>
            </div>
            <div>
              <div className="text-gray-500 text-sm">Address</div>
              <div className="font-medium">{shipment.sender.address}</div>
            </div>
            <div>
              <div className="text-gray-500 text-sm">Phone</div>
              <div className="font-medium">{shipment.sender.phone}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <FaUser className="mr-2 text-blue-600" />
            Receiver Information
          </h2>
          <div className="space-y-4">
            <div>
              <div className="text-gray-500 text-sm">Name</div>
              <div className="font-medium">{shipment.receiver.name}</div>
            </div>
            <div>
              <div className="text-gray-500 text-sm">Address</div>
              <div className="font-medium">{shipment.receiver.address}</div>
            </div>
            <div>
              <div className="text-gray-500 text-sm">Phone</div>
              <div className="font-medium">{shipment.receiver.phone}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <FaMapMarkerAlt className="mr-2 text-blue-600" />
          Tracking History
        </h2>
        <ShipmentStatus steps={shipment.tracking} />
      </div>
    </div>
  );
}