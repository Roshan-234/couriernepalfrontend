'use client';

import { FaPrint, FaDownload } from 'react-icons/fa';

const InvoiceGenerator = ({ shipment }: { shipment: any }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    alert('Invoice downloaded!');
    // Actual implementation would generate a PDF
  };

  return (
    <div className="flex space-x-2">
      <button 
        onClick={handlePrint}
        className="bg-blue-900 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-lg flex items-center"
      >
        <FaPrint className="mr-2" />
        Print Invoice
      </button>
      <button 
        onClick={handleDownload}
        className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg flex items-center"
      >
        <FaDownload className="mr-2" />
        Download Invoice
      </button>
    </div>
  );
};

export default InvoiceGenerator;