const PricingCard = ({ name, price, description, features, popular = false }: { 
  name: string, 
  price: string, 
  description: string, 
  features: string[], 
  popular?: boolean 
}) => {
  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden border-2 ${popular ? 'border-orange-500 relative' : 'border-transparent'}`}>
      {popular && (
        <div className="bg-orange-500 text-white text-center py-2 font-bold">
          Most Popular
        </div>
      )}
      <div className="p-8">
        <h3 className="text-2xl font-bold text-center mb-2">{name}</h3>
        <p className="text-3xl font-bold text-blue-900 text-center mb-2">{price}</p>
        <p className="text-gray-600 text-center mb-6">{description}</p>
        
        <ul className="mb-8">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start mb-3">
              <svg className="h-5 w-5 text-green-500 mr-2 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        
        <button className={`w-full py-3 rounded-lg font-bold ${
          popular 
            ? 'bg-orange-500 hover:bg-orange-600 text-white' 
            : 'bg-blue-900 hover:bg-blue-800 text-white'
        }`}>
          Select Plan
        </button>
      </div>
    </div>
  );
};

export default PricingCard;