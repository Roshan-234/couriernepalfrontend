import Link from 'next/link';
import { FaUser, FaPhone } from 'react-icons/fa';

const Header = () => {
  return (
    <header className="bg-white shadow-md">
      {/* Top bar */}
      <div className="bg-blue-900 text-white py-2">
        <div className="container flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <FaPhone className="mr-2" />
              <span>+977 1-5922458, 9851011426</span>
            </div>
            <span>moonlightfreight@gmail.com</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login" className="flex items-center">
              <FaUser className="mr-2" />
              <span>Login / Register</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="container py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-3xl font-bold text-blue-900">
            Moonlight Freight Pvt. Ltd.
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="font-medium hover:text-blue-700">Home</Link>
            <Link href="/services" className="font-medium hover:text-blue-700">Services</Link>
            <Link href="/pricing" className="font-medium hover:text-blue-700">Pricing</Link>
            <Link href="/tracking" className="font-medium hover:text-blue-700">Tracking</Link>
            <Link href="/contact" className="font-medium hover:text-blue-700">Contact</Link>
            <Link href="/about" className="font-medium hover:text-blue-700">About</Link>
          </nav>

          <button className="bg-orange-500 text-white px-6 py-2 rounded-full font-medium hover:bg-orange-600 transition">
            Book a Pickup
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;