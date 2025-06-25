import { FaShippingFast, FaGlobeAsia, FaWarehouse, FaLaptopHouse } from 'react-icons/fa';

const ServiceCards = () => {
  const services = [
    {
      icon: <FaShippingFast size={40} className="text-blue-600" />,
      title: 'Domestic Delivery',
      description: 'Fast and secure delivery across all regions of Nepal'
    },
    {
      icon: <FaGlobeAsia size={40} className="text-blue-600" />,
      title: 'International Shipping',
      description: 'Worldwide shipping with competitive rates'
    },
    {
      icon: <FaWarehouse size={40} className="text-blue-600" />,
      title: 'Warehouse Solutions',
      description: 'Safe storage solutions for your goods'
    },
    {
      icon: <FaLaptopHouse size={40} className="text-blue-600" />,
      title: 'E-commerce Support',
      description: 'Dedicated solutions for online businesses'
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Our Services</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We provide comprehensive courier and logistics solutions tailored to your needs
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <div 
              key={index} 
              className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition text-center"
            >
              <div className="flex justify-center mb-4">
                {service.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
              <p className="text-gray-600">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServiceCards;