'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FaTachometerAlt, 
  FaBox, 
  FaPlusCircle, 
  FaUser, 
  FaSignOutAlt,
  FaHome
} from 'react-icons/fa';

const DashboardSidebar = () => {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="w-64 bg-blue-900 text-white min-h-screen">
      <div className="p-6 border-b border-blue-800">
        <h1 className="text-xl font-bold">Courier Nepal</h1>
        <p className="text-sm text-blue-200">Dashboard</p>
      </div>
      <nav className="p-4">
        <ul className="space-y-2">
          <li>
            <Link 
              href="/dashboard" 
              className={`flex items-center p-3 rounded-lg transition ${
                isActive('/dashboard') ? 'bg-blue-800' : 'hover:bg-blue-800'
              }`}
            >
              <FaTachometerAlt className="mr-3" />
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link 
              href="/dashboard/shipments" 
              className={`flex items-center p-3 rounded-lg transition ${
                isActive('/dashboard/shipments') ? 'bg-blue-800' : 'hover:bg-blue-800'
              }`}
            >
              <FaBox className="mr-3" />
              <span>My Shipments</span>
            </Link>
          </li>
          <li>
            <Link 
              href="/dashboard/create-shipment" 
              className={`flex items-center p-3 rounded-lg transition ${
                isActive('/dashboard/create-shipment') ? 'bg-blue-800' : 'hover:bg-blue-800'
              }`}
            >
              <FaPlusCircle className="mr-3" />
              <span>Create Shipment</span>
            </Link>
          </li>
          <li>
            <Link 
              href="/dashboard/profile" 
              className={`flex items-center p-3 rounded-lg transition ${
                isActive('/dashboard/profile') ? 'bg-blue-800' : 'hover:bg-blue-800'
              }`}
            >
              <FaUser className="mr-3" />
              <span>My Profile</span>
            </Link>
          </li>
          <li className="border-t border-blue-800 pt-2 mt-2 space-y-1">
            <Link 
              href="/" 
              className="flex items-center p-3 rounded-lg hover:bg-blue-800 transition"
            >
              <FaHome className="mr-3" />
              <span>Back to Home</span>
            </Link>
            <Link 
              href="/auth/login" 
              className="flex items-center p-3 rounded-lg hover:bg-blue-800 transition"
            >
              <FaSignOutAlt className="mr-3" />
              <span>Logout</span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default DashboardSidebar;
