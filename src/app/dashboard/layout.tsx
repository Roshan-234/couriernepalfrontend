import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/dashboard/Sidebar';
import ProtectedRoute from '@/components/layout/ProtectedRoute';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  
  return (
    <ProtectedRoute roles={['customer', 'admin', 'agent']}>
      <div className="flex min-h-screen">
        <Sidebar role={user?.role} />
        <div className="flex-1 p-6 bg-gray-50">
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
}