import { FaUsers, FaGlobeAsia, FaTruck, FaSmile } from 'react-icons/fa';

const stats = [
  {
    icon: <FaUsers className="text-4xl text-blue-600" />,
    number: '50,000+',
    label: 'Happy Customers'
  },
  {
    icon: <FaGlobeAsia className="text-4xl text-blue-600" />,
    number: '200+',
    label: 'Countries Served'
  },
  {
    icon: <FaTruck className="text-4xl text-blue-600" />,
    number: '1M+',
    label: 'Parcels Delivered'
  },
  {
    icon: <FaSmile className="text-4xl text-blue-600" />,
    number: '99%',
    label: 'Customer Satisfaction'
  }
];

export default function StatsSection() {
  return (
    <section className="py-16 bg-blue-900 text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="mb-4">{stat.icon}</div>
              <div className="text-4xl font-bold mb-2">{stat.number}</div>
              <div className="text-blue-200">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
