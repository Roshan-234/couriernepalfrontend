'use client';

import { useState } from 'react';

const PricingCalculator = () => {
  const [weight, setWeight] = useState<number>(1);
  const [origin, setOrigin] = useState<string>('kathmandu');
  const [destination, setDestination] = useState<string>('pokhara');
  const [service, setService] = useState<string>('standard');
  const [price, setPrice] = useState<number | null>(null);

  const calculatePrice = () => {
    // This is simplified calculation logic
    let basePrice = 0;
    if (service === 'standard') {
      basePrice = 150;
    } else if (service === 'express') {
      basePrice = 250;
    } else if (service === 'international') {
      basePrice = 1500;
    }

    // Add weight cost (Rs. 50 per kg after first kg)
    const weightCost = Math.max(0, weight - 1) * 50;

    // Add destination multiplier
    let destinationMultiplier = 1;
    if (destination === 'pokhara') destinationMultiplier = 1.2;
    if (destination === 'chitwan') destinationMultiplier = 1.5;
    if (destination === 'biratnagar') destinationMultiplier = 2;

    const totalPrice = (basePrice + weightCost) * destinationMultiplier;
    setPrice(Math.round(totalPrice));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-gray-700 mb-2">Weight (kg)</label>
          <input
            type="number"
            min="0.1"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(parseFloat(e.target.value))}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Origin</label>
          <select
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
          >
            <option value="kathmandu">Kathmandu</option>
            <option value="lalitpur">Lalitpur</option>
            <option value="bhaktapur">Bhaktapur</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Destination</label>
          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
          >
            <option value="pokhara">Pokhara</option>
            <option value="chitwan">Chitwan</option>
            <option value="biratnagar">Biratnagar</option>
            <option value="dhangadhi">Dhangadhi</option>
            <option value="nepalgunj">Nepalgunj</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Service Type</label>
          <select
            value={service}
            onChange={(e) => setService(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
          >
            <option value="standard">Standard</option>
            <option value="express">Express</option>
            <option value="international">International</option>
          </select>
        </div>
      </div>
      
      <button
        onClick={calculatePrice}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg"
      >
        Calculate Price
      </button>

      {price !== null && (
        <div className="text-center mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="text-lg font-semibold">Estimated Price</div>
          <div className="text-4xl font-bold text-blue-900 mt-2">Rs. {price}</div>
          <p className="text-gray-600 mt-2">Price may vary based on actual package dimensions</p>
        </div>
      )}
    </div>
  );
};

export default PricingCalculator;