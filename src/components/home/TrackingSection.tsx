import { FaSearch } from 'react-icons/fa';

const TrackingSection = () => {
  return (
    <section className="py-16 bg-blue-900 text-white">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Track Your Shipment</h2>
          <p className="mb-8 text-lg">
            Enter your tracking number to get the latest status of your shipment
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <input 
              type="text" 
              placeholder="Enter your tracking number"
              className="flex-grow px-6 py-4 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button className="bg-orange-500 hover:bg-orange-600 px-8 py-4 rounded-lg font-medium flex items-center justify-center gap-2 transition">
              <FaSearch />
              <span>Track</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrackingSection;