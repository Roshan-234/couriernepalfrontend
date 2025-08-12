import { FaGooglePlay, FaApple } from 'react-icons/fa';

export default function DownloadApp() {
  return (
    <section className="py-16 bg-blue-900 text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4">Download Our Mobile App</h2>
            <p className="text-blue-100 mb-8">
              Track your shipments, get instant quotes, and manage your deliveries on the go with our mobile app.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="#" 
                className="flex items-center justify-center bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition duration-300"
              >
                <FaGooglePlay className="text-2xl mr-3" />
                <div>
                  <div className="text-xs">GET IT ON</div>
                  <div className="text-xl font-semibold">Google Play</div>
                </div>
              </a>
              <a 
                href="#" 
                className="flex items-center justify-center bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition duration-300"
              >
                <FaApple className="text-2xl mr-3" />
                <div>
                  <div className="text-xs">Download on the</div>
                  <div className="text-xl font-semibold">App Store</div>
                </div>
              </a>
            </div>
          </div>
          
          <div className="hidden lg:block">
            <img 
              src="/mobile-app.png" 
              alt="Courier Nepal Mobile App"
              className="max-w-md mx-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
