export default function AdminSettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Admin Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">General Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Company Name</label>
              <input
                type="text"
                defaultValue="Courier Nepal"
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Default Currency</label>
              <select className="w-full p-3 border border-gray-300 rounded-lg">
                <option>NPR (रू)</option>
                <option>USD ($)</option>
                <option>EUR (€)</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Timezone</label>
              <select className="w-full p-3 border border-gray-300 rounded-lg">
                <option>Asia/Kathmandu (GMT+5:45)</option>
                <option>UTC</option>
              </select>
            </div>
            <button className="bg-blue-900 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-lg">
              Save General Settings
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Shipping Rates</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Domestic Standard (per kg)</label>
              <input
                type="number"
                defaultValue="150"
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Domestic Express (per kg)</label>
              <input
                type="number"
                defaultValue="250"
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">International (per kg)</label>
              <input
                type="number"
                defaultValue="1500"
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>
            <button className="bg-blue-900 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-lg">
              Save Shipping Rates
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 md:col-span-2">
          <h2 className="text-xl font-bold mb-4">Notification Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-bold mb-3">Email Notifications</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="email-new-user"
                    defaultChecked
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="email-new-user" className="ml-2 block text-gray-700">
                    New user registration
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="email-new-order"
                    defaultChecked
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="email-new-order" className="ml-2 block text-gray-700">
                    New shipment created
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="email-delivery"
                    defaultChecked
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="email-delivery" className="ml-2 block text-gray-700">
                    Shipment delivered
                  </label>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-3">SMS Notifications</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="sms-new-user"
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="sms-new-user" className="ml-2 block text-gray-700">
                    New user registration
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="sms-new-order"
                    defaultChecked
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="sms-new-order" className="ml-2 block text-gray-700">
                    New shipment created
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="sms-delivery"
                    defaultChecked
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="sms-delivery" className="ml-2 block text-gray-700">
                    Shipment delivered
                  </label>
                </div>
              </div>
            </div>
            <div className="md:col-span-2">
              <button className="bg-blue-900 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-lg">
                Save Notification Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}