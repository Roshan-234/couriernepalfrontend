'use client';

import { useState } from 'react';
import { 
  FaUser, 
  FaMapMarkerAlt, 
  FaBox, 
  FaInfoCircle, 
  FaMoneyBillWave,
  FaArrowLeft
} from 'react-icons/fa';

export default function CreateShipmentPage() {
  const [step, setStep] = useState(1);
  const [shipment, setShipment] = useState({
    sender: {
      name: '',
      address: '',
      phone: '',
      email: ''
    },
    receiver: {
      name: '',
      address: '',
      phone: '',
      email: ''
    },
    packageDetails: {
      weight: '',
      dimensions: '',
      description: '',
      value: ''
    },
    service: 'standard',
    paymentMethod: 'cash'
  });

  const handleChange = (section: string, field: string, value: string) => {
    setShipment(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Shipment created:', shipment);
    // Submit to backend
    alert('Shipment created successfully!');
    // Redirect to shipments page
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <button onClick={prevStep} className="mr-4 p-2 rounded-full hover:bg-gray-200">
          <FaArrowLeft />
        </button>
        <h1 className="text-2xl font-bold">Create New Shipment</h1>
      </div>
      
      <div className="mb-8">
        <div className="flex justify-between">
          {[1, 2, 3, 4].map((stepNum) => (
            <div key={stepNum} className={`w-1/4 text-center relative ${stepNum < 4 ? 'pr-8' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${
                step === stepNum 
                  ? 'bg-blue-900 text-white border-2 border-blue-900' 
                  : step > stepNum 
                    ? 'bg-green-500 text-white' 
                    : 'bg-white border-2 border-gray-300'
              }`}>
                {stepNum}
              </div>
              <div className="text-sm">
                {stepNum === 1 && 'Sender/Receiver'}
                {stepNum === 2 && 'Package Details'}
                {stepNum === 3 && 'Service'}
                {stepNum === 4 && 'Payment'}
              </div>
              {stepNum < 4 && (
                <div className="absolute top-4 right-0 w-6 h-0.5 bg-gray-300"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <FaUser className="mr-2 text-blue-600" />
                Sender Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={shipment.sender.name}
                    onChange={(e) => handleChange('sender', 'name', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Address</label>
                  <textarea
                    value={shipment.sender.address}
                    onChange={(e) => handleChange('sender', 'address', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    required
                  ></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={shipment.sender.phone}
                      onChange={(e) => handleChange('sender', 'phone', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={shipment.sender.email}
                      onChange={(e) => handleChange('sender', 'email', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <FaUser className="mr-2 text-blue-600" />
                Receiver Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={shipment.receiver.name}
                    onChange={(e) => handleChange('receiver', 'name', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Address</label>
                  <textarea
                    value={shipment.receiver.address}
                    onChange={(e) => handleChange('receiver', 'address', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    required
                  ></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={shipment.receiver.phone}
                      onChange={(e) => handleChange('receiver', 'phone', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={shipment.receiver.email}
                      onChange={(e) => handleChange('receiver', 'email', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <FaBox className="mr-2 text-blue-600" />
              Package Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 mb-2">Weight (kg)</label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={shipment.packageDetails.weight}
                  onChange={(e) => handleChange('packageDetails', 'weight', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Dimensions (LxWxH in cm)</label>
                <input
                  type="text"
                  value={shipment.packageDetails.dimensions}
                  onChange={(e) => handleChange('packageDetails', 'dimensions', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="e.g. 30x20x15"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-2">Package Description</label>
                <textarea
                  value={shipment.packageDetails.description}
                  onChange={(e) => handleChange('packageDetails', 'description', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                ></textarea>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Declared Value (Rs.)</label>
                <input
                  type="number"
                  min="0"
                  value={shipment.packageDetails.value}
                  onChange={(e) => handleChange('packageDetails', 'value', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <FaInfoCircle className="mr-2 text-blue-600" />
              Service Options
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`border-2 rounded-lg p-6 cursor-pointer ${
                shipment.service === 'standard' ? 'border-blue-900 bg-blue-50' : 'border-gray-300'
              }`} onClick={() => handleChange('', 'service', 'standard')}>
                <h3 className="text-lg font-bold mb-2">Standard Delivery</h3>
                <p className="text-gray-600 mb-4">2-3 business days</p>
                <p className="text-2xl font-bold">Rs. 150</p>
              </div>
              <div className={`border-2 rounded-lg p-6 cursor-pointer ${
                shipment.service === 'express' ? 'border-blue-900 bg-blue-50' : 'border-gray-300'
              }`} onClick={() => handleChange('', 'service', 'express')}>
                <h3 className="text-lg font-bold mb-2">Express Delivery</h3>
                <p className="text-gray-600 mb-4">Next business day</p>
                <p className="text-2xl font-bold">Rs. 250</p>
              </div>
              <div className={`border-2 rounded-lg p-6 cursor-pointer ${
                shipment.service === 'international' ? 'border-blue-900 bg-blue-50' : 'border-gray-300'
              }`} onClick={() => handleChange('', 'service', 'international')}>
                <h3 className="text-lg font-bold mb-2">International</h3>
                <p className="text-gray-600 mb-4">5-7 business days</p>
                <p className="text-2xl font-bold">Rs. 1500</p>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <FaMoneyBillWave className="mr-2 text-blue-600" />
              Payment Method
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`border-2 rounded-lg p-6 cursor-pointer ${
                shipment.paymentMethod === 'cash' ? 'border-blue-900 bg-blue-50' : 'border-gray-300'
              }`} onClick={() => handleChange('', 'paymentMethod', 'cash')}>
                <h3 className="text-lg font-bold mb-2">Cash on Delivery</h3>
                <p className="text-gray-600">Pay when package is delivered</p>
              </div>
              <div className={`border-2 rounded-lg p-6 cursor-pointer ${
                shipment.paymentMethod === 'online' ? 'border-blue-900 bg-blue-50' : 'border-gray-300'
              }`} onClick={() => handleChange('', 'paymentMethod', 'online')}>
                <h3 className="text-lg font-bold mb-2">Online Payment</h3>
                <p className="text-gray-600">Pay now with credit card or e-wallet</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-between">
          {step > 1 && (
            <button 
              type="button"
              onClick={prevStep}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded-lg"
            >
              Back
            </button>
          )}
          <div className="ml-auto">
            {step < 4 ? (
              <button 
                type="button"
                onClick={nextStep}
                className="bg-blue-900 hover:bg-blue-800 text-white font-bold py-2 px-6 rounded-lg"
              >
                Next
              </button>
            ) : (
              <button 
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg"
              >
                Create Shipment
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}