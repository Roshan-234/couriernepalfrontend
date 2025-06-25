import Link from 'next/link';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Company Info */}
        <div>
          <h3 className="text-2xl font-bold mb-4">Courier Nepal</h3>
          <p className="mb-4 text-gray-300">
            Fast, reliable and affordable courier services across Nepal and beyond.
          </p>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-400 hover:text-white"><FaFacebook size={20} /></a>
            <a href="#" className="text-gray-400 hover:text-white"><FaTwitter size={20} /></a>
            <a href="#" className="text-gray-400 hover:text-white"><FaInstagram size={20} /></a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2">
            <li><Link href="/" className="text-gray-400 hover:text-white">Home</Link></li>
            <li><Link href="/services" className="text-gray-400 hover:text-white">Services</Link></li>
            <li><Link href="/pricing" className="text-gray-400 hover:text-white">Pricing</Link></li>
            <li><Link href="/tracking" className="text-gray-400 hover:text-white">Tracking</Link></li>
            <li><Link href="/about" className="text-gray-400 hover:text-white">About Us</Link></li>
          </ul>
        </div>

        {/* Services */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Our Services</h4>
          <ul className="space-y-2">
            <li><Link href="#" className="text-gray-400 hover:text-white">Domestic Delivery</Link></li>
            <li><Link href="#" className="text-gray-400 hover:text-white">International Shipping</Link></li>
            <li><Link href="#" className="text-gray-400 hover:text-white">Express Courier</Link></li>
            <li><Link href="#" className="text-gray-400 hover:text-white">Warehouse Solutions</Link></li>
            <li><Link href="#" className="text-gray-400 hover:text-white">Logistics</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
          <ul className="space-y-3">
            <li className="flex items-start">
              <FaMapMarkerAlt className="mt-1 mr-3 text-orange-500" />
              <span>Kathmandu, Nepal</span>
            </li>
            <li className="flex items-center">
              <FaPhone className="mr-3 text-orange-500" />
              <span>+977 1-1234567</span>
            </li>
            <li className="flex items-center">
              <FaEnvelope className="mr-3 text-orange-500" />
              <span>info@couriernepal.com</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="container border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
        <p>&copy; {new Date().getFullYear()} Courier Nepal. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;