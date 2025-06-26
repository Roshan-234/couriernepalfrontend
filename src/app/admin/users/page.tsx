import UserTable from '@/components/admin/UserTable';

export default function UserManagementPage() {
  // Mock data
  const users = Array.from({ length: 20 }).map((_, index) => ({
    id: `U${1000 + index}`,
    name: `User ${index + 1}`,
    email: `user${index + 1}@example.com`,
    role: index % 5 === 0 ? 'admin' : 'user',
    status: index % 3 === 0 ? 'active' : 'inactive',
    joined: `Oct ${15 + index}, 2023`
  }));

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">User Management</h1>
        <button className="bg-blue-900 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-lg">
          Add New User
        </button>
      </div>
      <UserTable users={users} />
    </div>
  );
}