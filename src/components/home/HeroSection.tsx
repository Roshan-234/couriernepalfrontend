import Link from 'next/link';

const HeroSection = () => {
  return (
    <div className="relative bg-blue-900 text-white">
      <div className="absolute inset-0 bg-opacity-70 bg-blue-900">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-blue-700 opacity-90"></div>
      </div>
      
      <div className="container py-28 relative z-10">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Fast & Reliable Courier Services in Nepal
          </h1>
          <p className="text-xl mb-8">
            We deliver your parcels with care and on time. Domestic and international shipping solutions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/tracking" 
              className="bg-white text-blue-900 font-bold px-8 py-3 rounded-lg hover:bg-gray-100 transition text-center"
            >
              Track Your Shipment
            </Link>
            <Link 
              href="/services" 
              className="bg-transparent border-2 border-white text-white font-bold px-8 py-3 rounded-lg hover:bg-white hover:text-blue-900 transition text-center"
            >
              Our Services
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;