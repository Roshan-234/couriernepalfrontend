import { useSession } from 'next-auth/react';
import { FaBell, FaUserCircle } from 'react-icons/fa';

const DashboardHeader = () => {
  const { data: session } = useSession();

  return (
    <header className="bg-white shadow-sm">
      <div className="flex justify-between items-center px-6 py-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button className="relative p-2 rounded-full hover:bg-gray-100">
            <FaBell className="text-gray-600" />
            <span className="absolute top-1 right-1 bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              3
            </span>
          </button>
          <div className="flex items-center">
            <div className="mr-3 text-right">
              <p className="text-sm font-medium text-gray-800">
                {session?.user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-500">
                {session?.user?.email || 'user@example.com'}
              </p>
            </div>
            <div className="bg-gray-200 border-2 border-dashed rounded-full w-10 h-10 flex items-center justify-center">
              <FaUserCircle className="text-gray-500 text-xl" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;