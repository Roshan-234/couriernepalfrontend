import { useQuery } from 'react-query';
import api from '@/lib/api';
// import UserTable from '@/components/admin/UserTable';
import ProtectedRoute from '@/components/layout/ProtectedRoute';

export default function AdminUsersPage() {
  const { data: users, isLoading } = useQuery('users', () =>
    api.get('/admin/users').then(res => res.data)
  );

  return (
    <ProtectedRoute roles={['admin']}>
      <div>
        <h1 className="text-2xl font-bold mb-6">User Management</h1>
        
        {isLoading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        ) : (
        //   <UserTable users={users} />
        ""
        )}
      </div>
    </ProtectedRoute>
  );
}