import AdminCard from '@/components/admin/AdminCard';
import { 
  FaUsers, 
  FaBox, 
  FaMoneyBillWave, 
  FaChartLine 
} from 'react-icons/fa';

export default function AdminDashboard() {
  const stats = [
    { title: 'Total Users', value: 256, icon: <FaUsers size={24} />, change: '+12%' },
    { title: 'Total Shipments', value: 1240, icon: <FaBox size={24} />, change: '+5.2%' },
    { title: 'Revenue', value: 'Rs. 1,245,000', icon: <FaMoneyBillWave size={24} />, change: '+18.3%' },
    { title: 'Avg. Delivery Time', value: '1.8 Days', icon: <FaChartLine size={24} />, change: '-0.3 Days' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <AdminCard 
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            change={stat.change}
          />
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Recent Users</h2>
          {/* User table would go here */}
          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-64" />
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Shipment Analytics</h2>
          {/* Chart would go here */}
          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-64" />
        </div>
      </div>
    </div>
  );
}