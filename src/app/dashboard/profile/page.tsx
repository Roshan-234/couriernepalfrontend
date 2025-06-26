'use client';

import { useSession } from 'next-auth/react';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit } from 'react-icons/fa';

export default function ProfilePage() {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    name: session?.user?.name || 'John Doe',
    email: session?.user?.email || 'john.doe@example.com',
    phone: '+977 9841000000',
    address: '123 Main Street, Kathmandu, Nepal'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    // Save to backend
    alert('Profile updated successfully!');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <div className="bg-gray-200 border-2 border-dashed rounded-full w-16 h-16 flex items-center justify-center mr-4">
              <FaUser className="text-gray-500 text-2xl" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{userData.name}</h2>
              <p className="text-gray-600">{userData.email}</p>
            </div>
          </div>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="bg-blue-900 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-lg flex items-center"
          >
            <FaEdit className="mr-2" />
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={userData.name}
                    onChange={handleInputChange}
                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={userData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg"
                    required
                    disabled
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Phone</label>
                <div className="relative">
                  <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={userData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-2">Address</label>
                <div className="relative">
                  <FaMapMarkerAlt className="absolute left-3 top-4 text-gray-400" />
                  <textarea
                    name="address"
                    value={userData.address}
                    onChange={handleInputChange}
                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg"
                    rows={3}
                    required
                  ></textarea>
                </div>
              </div>
            </div>
            <div className="mt-6 text-right">
              <button 
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start">
              <FaUser className="text-blue-600 mt-1 mr-4" />
              <div>
                <h3 className="text-sm text-gray-500">Full Name</h3>
                <p className="text-lg">{userData.name}</p>
              </div>
            </div>
            <div className="flex items-start">
              <FaEnvelope className="text-blue-600 mt-1 mr-4" />
              <div>
                <h3 className="text-sm text-gray-500">Email</h3>
                <p className="text-lg">{userData.email}</p>
              </div>
            </div>
            <div className="flex items-start">
              <FaPhone className="text-blue-600 mt-1 mr-4" />
              <div>
                <h3 className="text-sm text-gray-500">Phone</h3>
                <p className="text-lg">{userData.phone}</p>
              </div>
            </div>
            <div className="flex items-start">
              <FaMapMarkerAlt className="text-blue-600 mt-1 mr-4" />
              <div>
                <h3 className="text-sm text-gray-500">Address</h3>
                <p className="text-lg">{userData.address}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Security Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Current Password</label>
              <input
                type="password"
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="Enter current password"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">New Password</label>
              <input
                type="password"
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Confirm New Password</label>
              <input
                type="password"
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="Confirm new password"
              />
            </div>
            <button className="bg-blue-900 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-lg">
              Update Password
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Notification Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="email-notifications"
                className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                defaultChecked
              />
              <label htmlFor="email-notifications" className="ml-2 block text-gray-700">
                Email Notifications
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="sms-notifications"
                className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                defaultChecked
              />
              <label htmlFor="sms-notifications" className="ml-2 block text-gray-700">
                SMS Notifications
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="promotional-offers"
                className="h-5 w-5 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="promotional-offers" className="ml-2 block text-gray-700">
                Promotional Offers
              </label>
            </div>
            <button className="bg-blue-900 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-lg">
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}