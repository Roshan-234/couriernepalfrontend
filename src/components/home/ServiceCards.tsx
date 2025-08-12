'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaTruck, FaGlobeAsia, FaBoxOpen, FaWarehouse, FaShippingFast, FaHandshake } from 'react-icons/fa';

const services = [
  {
    title: 'Domestic Delivery',
    description: 'Same-day delivery within city limits and express nationwide shipping',
    icon: FaTruck,
    link: '/services/domestic'
  },
  {
    title: 'International Shipping',
    description: 'Reliable global shipping with real-time tracking and customs assistance',
    icon: FaGlobeAsia,
    link: '/services/international'
  },
  {
    title: 'Express Cargo',
    description: 'Fast and secure cargo services for time-sensitive deliveries',
    icon: FaShippingFast,
    link: '/services/express'
  },
  {
    title: 'Warehouse Solutions',
    description: 'Modern warehousing facilities with inventory management',
    icon: FaWarehouse,
    link: '/services/warehouse'
  },
  {
    title: 'E-commerce Logistics',
    description: 'Integrated logistics solutions for online businesses',
    icon: FaBoxOpen,
    link: '/services/ecommerce'
  },
  {
    title: 'Corporate Services',
    description: 'Customized logistics solutions for businesses',
    icon: FaHandshake,
    link: '/services/corporate'
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

export default function ServiceCards() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {services.map((service, index) => {
        const Icon = service.icon;
        return (
          <motion.div
            key={index}
            variants={itemVariants}
            className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-soft hover:shadow-lg transition-shadow"
          >
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-primary-100 opacity-20 transition-transform group-hover:scale-150" />
            
            {/* Icon */}
            <div className="relative mb-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                <Icon className="h-6 w-6" />
              </div>
            </div>

            {/* Content */}
            <div className="relative">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {service.title}
              </h3>
              <p className="text-gray-600 mb-4">
                {service.description}
              </p>
              <Link 
                href={service.link}
                className="inline-flex items-center text-primary-600 hover:text-primary-700"
              >
                Learn more
                <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}