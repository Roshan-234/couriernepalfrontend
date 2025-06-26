import DashboardCard from '@/components/dashboard/DashboardCard';
import RecentShipments from '@/components/dashboard/RecentShipments';
import { 
  FaBox, 
  FaShippingFast, 
  FaCheckCircle, 
  FaMoneyBillWave 
} from 'react-icons/fa';

export default function DashboardPage() {
  // Mock data
  const stats = [
    { title: 'Total Shipments', value: 24, icon: <FaBox size={24} />, color: 'bg-blue-500' },
    { title: 'In Transit', value: 5, icon: <FaShippingFast size={24} />, color: 'bg-yellow-500' },
    { title: 'Delivered', value: 18, icon: <FaCheckCircle size={24} />, color: 'bg-green-500' },
    { title: 'Pending Payment', value: 1, icon: <FaMoneyBillWave size={24} />, color: 'bg-red-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <DashboardCard 
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>
      
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Recent Shipments</h2>
        <RecentShipments />
      </div>
    </div>
  );
}