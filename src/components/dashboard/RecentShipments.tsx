import Link from 'next/link';

const RecentShipments = () => {
  const shipments = [
    { id: 'CN123456789', sender: 'John Doe', receiver: 'Jane Smith', status: 'Delivered', date: 'Oct 15, 2023' },
    { id: 'CN123456788', sender: 'Tech Solutions', receiver: 'Robert Johnson', status: 'In Transit', date: 'Oct 16, 2023' },
    { id: 'CN123456787', sender: 'Global Imports', receiver: 'Sarah Williams', status: 'Processing', date: 'Oct 17, 2023' },
    { id: 'CN123456786', sender: 'Mike Thompson', receiver: 'Lisa Anderson', status: 'Delivered', date: 'Oct 18, 2023' },
    { id: 'CN123456785', sender: 'Book Store', receiver: 'David Miller', status: 'In Transit', date: 'Oct 19, 2023' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'In Transit': return 'bg-yellow-100 text-yellow-800';
      case 'Processing': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tracking ID
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sender/Receiver
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {shipments.map((shipment) => (
            <tr key={shipment.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                <Link href={`/dashboard/shipments/${shipment.id}`}>
                  {shipment.id}
                </Link>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {shipment.sender} → {shipment.receiver}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(shipment.status)}`}>
                  {shipment.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {shipment.date}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                <Link href={`/dashboard/shipments/${shipment.id}`}>
                  View Details
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 text-right">
        <Link href="/dashboard/shipments" className="text-blue-600 hover:text-blue-800 font-medium">
          View All Shipments
        </Link>
      </div>
    </div>
  );
};

export default RecentShipments;