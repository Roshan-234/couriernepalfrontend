"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  TruckIcon,
  UsersIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CogIcon,
  MapIcon,
  BanknotesIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
  { name: 'Shipments', href: '/admin/shipments', icon: TruckIcon },
  { name: 'Customers', href: '/admin/customers', icon: UsersIcon },
  { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
  { name: 'Blog Posts', href: '/admin/blog', icon: DocumentTextIcon },
  { name: 'Tracking', href: '/admin/tracking', icon: MapIcon },
  { name: 'Finance', href: '/admin/finance', icon: BanknotesIcon },
  { name: 'Support', href: '/admin/support', icon: ChatBubbleLeftRightIcon },
  { name: 'Settings', href: '/admin/settings', icon: CogIcon },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-200 lg:bg-gray-800 lg:pt-5 lg:pb-4">
      {/* Logo */}
      <div className="flex items-center flex-shrink-0 px-6">
        <Link href="/admin/dashboard" className="flex items-center">
          <img
            className="h-8 w-auto"
            src="/logo.svg"
            alt="Courier Nepal"
          />
          <span className="ml-2 text-xl font-bold text-white">
            Courier Nepal
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="mt-8 flex-1 px-3 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                group flex items-center px-3 py-2 text-sm font-medium rounded-md
                ${isActive
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }
              `}
            >
              <item.icon
                className={`
                  mr-3 h-6 w-6
                  ${isActive
                    ? 'text-white'
                    : 'text-gray-400 group-hover:text-gray-300'
                  }
                `}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="px-3 mt-6">
        <div className="flex-shrink-0 w-full group block">
          <div className="flex items-center">
            <div>
              <img
                className="inline-block h-9 w-9 rounded-full"
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt=""
              />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">Admin User</p>
              <p className="text-xs font-medium text-gray-300">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
