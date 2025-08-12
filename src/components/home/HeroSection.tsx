'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaTruck, FaGlobeAsia, FaSearch } from 'react-icons/fa';
import { Button } from '@/components/common/Button';
import TrackingInput from '@/components/tracking/TrackingInput';

const HeroSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
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

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-primary-900 to-primary-800 text-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:16px]" />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary-900/90 via-primary-800/80 to-transparent" />

      {/* Content */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-5rem)] py-20">
          {/* Left Column */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center lg:text-left"
          >
            <motion.h1 
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight"
            >
              Fast & Reliable
              <span className="block text-secondary-400">Courier Services</span>
              in Nepal
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="mt-6 text-lg sm:text-xl text-primary-100 max-w-2xl mx-auto lg:mx-0"
            >
              We deliver your parcels safely and on time. Experience reliable shipping solutions for both domestic and international destinations.
            </motion.p>

            {/* Quick Actions */}
            <motion.div 
              variants={itemVariants}
              className="mt-8 space-y-6"
            >
              {/* Tracking Input */}
              <div className="max-w-xl mx-auto lg:mx-0">
                <TrackingInput />
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button href="/quote" size="lg" className="gap-2">
                  <FaTruck />
                  Get a Quote
                </Button>
                <Button href="/services" variant="outline" size="lg" className="gap-2">
                  <FaGlobeAsia />
                  Our Services
                </Button>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Features */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="hidden lg:block"
          >
            <div className="grid gap-6">
              <motion.div 
                variants={itemVariants}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/15 transition"
              >
                <h3 className="text-xl font-semibold mb-2">Domestic Delivery</h3>
                <p className="text-primary-100">Same-day delivery within city limits and express nationwide shipping options.</p>
              </motion.div>
              
              <motion.div 
                variants={itemVariants}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/15 transition"
              >
                <h3 className="text-xl font-semibold mb-2">International Shipping</h3>
                <p className="text-primary-100">Reliable global shipping with real-time tracking and customs assistance.</p>
              </motion.div>
              
              <motion.div 
                variants={itemVariants}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/15 transition"
              >
                <h3 className="text-xl font-semibold mb-2">Express Cargo</h3>
                <p className="text-primary-100">Fast and secure cargo services for time-sensitive deliveries.</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;