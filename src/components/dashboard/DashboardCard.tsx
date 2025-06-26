const DashboardCard = ({ title, value, icon, color }: { 
  title: string, 
  value: number, 
  icon: React.ReactNode,
  color: string
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-5">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-gray-500 text-sm">{title}</div>
            <div className="text-2xl font-bold mt-1">{value}</div>
          </div>
          <div className={`${color} text-white p-3 rounded-lg`}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;