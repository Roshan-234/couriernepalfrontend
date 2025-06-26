import { FaShippingFast, FaUsers, FaGlobeAsia, FaAward } from 'react-icons/fa';

const AboutPage = () => {
  const stats = [
    { icon: <FaShippingFast size={40} />, value: '10,000+', label: 'Monthly Shipments' },
    { icon: <FaUsers size={40} />, value: '50+', label: 'Dedicated Staff' },
    { icon: <FaGlobeAsia size={40} />, value: '100+', label: 'Destinations' },
    { icon: <FaAward size={40} />, value: '15+', label: 'Industry Awards' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-blue-900 text-white py-20">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold mb-6">About Us</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Your trusted partner for fast and reliable courier services in Nepal
          </p>
        </div>
      </div>

      {/* Our Story */}
      <div className="container mx-auto py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">Our Story</h2>
            <p className="text-gray-600 mb-4">
              Founded in 2010, Courier Nepal started with a simple mission: to provide fast, reliable, and affordable courier services across Nepal. What began as a small team of 5 people has now grown into one of the leading logistics companies in the country.
            </p>
            <p className="text-gray-600 mb-4">
              We've expanded our services to include international shipping, warehousing, and e-commerce logistics solutions. Despite our growth, we remain committed to our core values of customer satisfaction and operational excellence.
            </p>
            <p className="text-gray-600">
              Today, we serve thousands of customers every month, from individuals to large businesses, and we're proud to be a trusted name in the industry.
            </p>
          </div>
          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-96" />
        </div>
      </div>

      {/* Stats */}
      <div className="bg-blue-900 text-white py-16">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4 text-white">
                  {stat.icon}
                </div>
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-xl">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="container mx-auto py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-gray-600 mb-4">
              To revolutionize the logistics industry in Nepal by providing innovative, efficient, and customer-centric solutions that exceed expectations.
            </p>
            <p className="text-gray-600">
              We aim to be the preferred logistics partner for individuals and businesses by continuously improving our services and expanding our network.
            </p>
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-6">Our Vision</h2>
            <p className="text-gray-600 mb-4">
              To become the leading logistics provider in South Asia, known for our reliability, speed, and exceptional customer service.
            </p>
            <p className="text-gray-600">
              We envision a future where distance is no barrier to business, and where every shipment is handled with the utmost care and professionalism.
            </p>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="container mx-auto py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Meet Our Leadership</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our dedicated team of professionals is committed to providing you with the best service possible.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {[
            { name: 'John Doe', position: 'CEO & Founder' },
            { name: 'Jane Smith', position: 'Operations Director' },
            { name: 'Robert Johnson', position: 'Technology Lead' },
            { name: 'Sarah Williams', position: 'Customer Experience Manager' },
          ].map((member, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gray-200 border-2 border-dashed w-full h-64" />
              <div className="p-6 text-center">
                <h3 className="text-xl font-bold">{member.name}</h3>
                <p className="text-gray-600">{member.position}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutPage;