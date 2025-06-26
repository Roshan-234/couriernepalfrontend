const AdminCard = ({ title, value, icon, change }: { 
  title: string, 
  value: string | number, 
  icon: React.ReactNode,
  change: string
}) => {
  const isPositive = change.startsWith('+') || !change.startsWith('-');
  
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-gray-500 text-sm">{title}</div>
            <div className="text-2xl font-bold mt-1">{value}</div>
          </div>
          <div className="bg-blue-100 text-blue-800 p-3 rounded-lg">
            {icon}
          </div>
        </div>
        <div className={`mt-4 text-sm font-medium ${
          isPositive ? 'text-green-600' : 'text-red-600'
        }`}>
          {change} from last month
        </div>
      </div>
    </div>
  );
};

export default AdminCard;