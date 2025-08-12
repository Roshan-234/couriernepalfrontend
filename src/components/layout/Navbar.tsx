"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { FaPhone, FaEnvelope, FaUser, FaSignOutAlt, FaBox, FaBars, FaTimes } from 'react-icons/fa';
import { ButtonClient } from '@/components/common/ButtonClient';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Top Bar */}
      <div className="bg-blue-900 text-white py-2 hidden md:block">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex space-x-6">
              <a href="tel:+9775922458" className="flex items-center text-sm">
                <FaPhone className="mr-2" />
                <span>+977 1-5922458</span>
              </a>
              <a href="mailto:info@couriernepal.com" className="flex items-center text-sm">
                <FaEnvelope className="mr-2" />
                <span>info@couriernepal.com</span>
              </a>
            </div>
            <div className="flex space-x-4">
              {!user ? (
                <>
                  <Link href="/auth/login" className="text-sm hover:text-blue-200">Login</Link>
                  <Link href="/auth/register" className="text-sm hover:text-blue-200">Register</Link>
                </>
              ) : (
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-sm">
                    <FaUser />
                    <span>{user.first_name}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 hidden group-hover:block">
                    <Link href="/dashboard" className="flex items-center px-4 py-2 text-gray-800 hover:bg-gray-100">
                      <FaBox className="mr-2" />
                      <span>Dashboard</span>
                    </Link>
                    <button
                      onClick={logout}
                      className="flex items-center w-full px-4 py-2 text-gray-800 hover:bg-gray-100"
                    >
                      <FaSignOutAlt className="mr-2" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className={`bg-white ${isScrolled ? 'shadow-lg' : ''} sticky top-0 z-50 transition-shadow duration-300`}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-blue-900">Courier Nepal</span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/about" className="text-gray-700 hover:text-blue-900">About</Link>
              <Link href="/services" className="text-gray-700 hover:text-blue-900">Services</Link>
              <Link href="/pricing" className="text-gray-700 hover:text-blue-900">Pricing</Link>
              <Link href="/tracking" className="text-gray-700 hover:text-blue-900">Track</Link>
              <Link href="/contact" className="text-gray-700 hover:text-blue-900">Contact</Link>
              <ButtonClient 
                href={user ? "/dashboard/create-shipment" : "/auth/login"}
                variant="primary"
              >
                Ship Now
              </ButtonClient>
            </div>

            {/* Mobile Menu Button */}
            <ButtonClient 
              variant="ghost"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </ButtonClient>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-2 space-y-1">
              <Link href="/about" className="block py-2 text-gray-700">About</Link>
              <Link href="/services" className="block py-2 text-gray-700">Services</Link>
              <Link href="/pricing" className="block py-2 text-gray-700">Pricing</Link>
              <Link href="/tracking" className="block py-2 text-gray-700">Track</Link>
              <Link href="/contact" className="block py-2 text-gray-700">Contact</Link>
              {!user ? (
                <>
                  <Link href="/auth/login" className="block py-2 text-gray-700">Login</Link>
                  <Link href="/auth/register" className="block py-2 text-gray-700">Register</Link>
                </>
              ) : (
                <>
                  <Link href="/dashboard" className="block py-2 text-gray-700">Dashboard</Link>
                  <ButtonClient 
                    variant="ghost"
                    onClick={logout} 
                    className="w-full text-left"
                  >
                    Logout
                  </ButtonClient>
                </>
              )}
              <ButtonClient 
                href={user ? "/dashboard/create-shipment" : "/auth/login"}
                variant="primary"
                className="w-full mt-2"
              >
                Ship Now
              </ButtonClient>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
