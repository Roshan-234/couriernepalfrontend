"use client";

import { FaShippingFast, FaGlobeAsia, FaWarehouse, FaLaptopHouse, FaBoxOpen, FaTruck } from 'react-icons/fa';
import ServiceCard from '@/components/common/ServiceCard';
import { ButtonClient } from '@/components/common/ButtonClient';

const ServicesPage = () => {
  const services = [
    {
      icon: <FaShippingFast size={60} className="text-blue-600" />,
      title: 'Domestic Delivery',
      description: 'Fast and secure delivery across all regions of Nepal with real-time tracking',
      link: '/services/domestic'
    },
    {
      icon: <FaGlobeAsia size={60} className="text-blue-600" />,
      title: 'International Shipping',
      description: 'Worldwide shipping with competitive rates and customs clearance support',
      link: '/services/international'
    },
    {
      icon: <FaWarehouse size={60} className="text-blue-600" />,
      title: 'Warehouse Solutions',
      description: 'Secure storage facilities with inventory management services',
      link: '/services/warehouse'
    },
    {
      icon: <FaLaptopHouse size={60} className="text-blue-600" />,
      title: 'E-commerce Support',
      description: 'Dedicated logistics solutions for online businesses',
      link: '/services/ecommerce'
    },
    {
      icon: <FaBoxOpen size={60} className="text-blue-600" />,
      title: 'Packing Services',
      description: 'Professional packing for fragile and valuable items',
      link: '/services/packing'
    },
    {
      icon: <FaTruck size={60} className="text-blue-600" />,
      title: 'Express Delivery',
      description: 'Same-day and next-day delivery options',
      link: '/services/express'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-blue-900 text-white py-20">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold mb-6">Our Services</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Comprehensive logistics solutions tailored to your business needs
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="container mx-auto py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {services.map((service, index) => (
            <ServiceCard 
              key={index}
              icon={service.icon}
              title={service.title}
              description={service.description}
              link={service.link}
            />
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-50 py-16">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Ship with Us?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join thousands of satisfied customers who trust us with their deliveries
          </p>
          <div className="flex justify-center gap-4">
            <ButtonClient 
              variant="primary" 
              href="/dashboard/create-shipment"
            >
              Book a Pickup
            </ButtonClient>
            <ButtonClient 
              variant="secondary"
              href="/contact"
            >
              Contact Sales
            </ButtonClient>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;