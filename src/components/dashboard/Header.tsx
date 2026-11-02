'use client';
import { useAuth } from '@/contexts/AuthContext';
import { FaUserCircle } from 'react-icons/fa';

const DashboardHeader = () => {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow-sm">
      <div className="flex justify-between items-center px-6 py-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="mr-3 text-right">
              <p className="text-sm font-medium text-gray-800">
                {user ? `${user.first_name} ${user.last_name}` : 'Your account'}
              </p>
              <p className="text-xs text-gray-500">
                {user?.email}
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
