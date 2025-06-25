import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

const ProtectedRoute = ({ children, roles }: { 
  children: React.ReactNode;
  roles?: string[]; 
}) => {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    } else if (!loading && isAuthenticated && roles && !roles.includes(user?.role || '')) {
      router.push('/dashboard');
    }
  }, [loading, isAuthenticated, user, roles, router]);

  if (loading || !isAuthenticated || (roles && !roles.includes(user?.role || ''))) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;