import { FaShieldAlt, FaClock, FaHeadset, FaMoneyBillWave } from 'react-icons/fa';

const WhyChooseUs = () => {
  const features = [
    {
      icon: <FaShieldAlt size={40} className="text-blue-600" />,
      title: 'Safe & Secure',
      description: 'We ensure the safety and security of your shipments with advanced tracking and handling.'
    },
    {
      icon: <FaClock size={40} className="text-blue-600" />,
      title: 'On-Time Delivery',
      description: 'Our efficient logistics network guarantees timely delivery of your parcels.'
    },
    {
      icon: <FaHeadset size={40} className="text-blue-600" />,
      title: '24/7 Support',
      description: 'Our dedicated support team is available round the clock to assist you.'
    },
    {
      icon: <FaMoneyBillWave size={40} className="text-blue-600" />,
      title: 'Competitive Pricing',
      description: 'We offer the best rates in the market without compromising on service quality.'
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Choose Us?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We are committed to providing the best courier experience with our customer-centric approach
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition text-center"
            >
              <div className="flex justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;