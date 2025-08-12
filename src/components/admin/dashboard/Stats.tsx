import { TruckIcon, BanknotesIcon, UserGroupIcon, ClockIcon } from '@heroicons/react/24/outline';
import { getDashboardStats } from '@/lib/adminApi';

interface Stat {
  name: string;
  value: string | number;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: React.ElementType;
}

export default async function DashboardStats() {
  const stats = await getDashboardStats();
  
  const formattedStats: Stat[] = [
    {
      name: 'Total Shipments',
      value: stats.totalShipments.toLocaleString(),
      change: `${stats.shipmentChange}%`,
      changeType: stats.shipmentChange >= 0 ? 'increase' : 'decrease',
      icon: TruckIcon,
    },
    {
      name: 'Revenue',
      value: `$${stats.revenue.toLocaleString()}`,
      change: `${stats.revenueChange}%`,
      changeType: stats.revenueChange >= 0 ? 'increase' : 'decrease',
      icon: BanknotesIcon,
    },
    {
      name: 'Active Customers',
      value: stats.activeCustomers.toLocaleString(),
      change: `${stats.customerChange}%`,
      changeType: stats.customerChange >= 0 ? 'increase' : 'decrease',
      icon: UserGroupIcon,
    },
    {
      name: 'Average Delivery Time',
      value: `${stats.avgDeliveryTime} hours`,
      change: `${stats.deliveryTimeChange}%`,
      changeType: stats.deliveryTimeChange <= 0 ? 'increase' : 'decrease',
      icon: ClockIcon,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {formattedStats.map((stat) => (
        <div
          key={stat.name}
          className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6 sm:pt-6"
        >
          <dt>
            <div className="absolute rounded-md bg-blue-600 p-3">
              <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
            </div>
            <p className="ml-16 truncate text-sm font-medium text-gray-500">
              {stat.name}
            </p>
          </dt>
          <dd className="ml-16 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
            <p
              className={`ml-2 flex items-baseline text-sm font-semibold ${
                stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {stat.changeType === 'increase' ? '↑' : '↓'}
              {stat.change}
            </p>
          </dd>
        </div>
      ))}
    </div>
  );
}
