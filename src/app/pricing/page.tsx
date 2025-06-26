import PricingCalculator from '@/components/common/PricingCalculator';
import PricingCard from '@/components/common/PricingCard';

const PricingPage = () => {
  const pricingPlans = [
    {
      name: 'Domestic Standard',
      price: 'Rs. 150',
      description: 'Up to 1kg within same city',
      features: [
        'Delivery in 2-3 business days',
        'Online tracking',
        'Free pickup',
        'SMS notifications'
      ]
    },
    {
      name: 'Domestic Express',
      price: 'Rs. 250',
      description: 'Up to 1kg within same city',
      features: [
        'Next business day delivery',
        'Real-time tracking',
        'Free pickup',
        'SMS & email notifications',
        'Dedicated support'
      ],
      popular: true
    },
    {
      name: 'International Standard',
      price: 'Rs. 1500',
      description: 'Up to 1kg to major countries',
      features: [
        'Delivery in 5-7 business days',
        'Online tracking',
        'Free pickup',
        'Customs clearance',
        'Insurance up to Rs. 10,000'
      ]
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-blue-900 text-white py-20">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold mb-6">Transparent Pricing</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Competitive rates with no hidden fees. Calculate your shipping cost instantly.
          </p>
        </div>
      </div>

      {/* Pricing Calculator */}
      <div className="container mx-auto py-16">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Shipping Cost Calculator</h2>
          <PricingCalculator />
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Our Pricing Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <PricingCard 
                key={index}
                name={plan.name}
                price={plan.price}
                description={plan.description}
                features={plan.features}
                popular={plan.popular}
              />
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto py-16">
        <h2 className="text-3xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto">
          {[
            {
              question: 'How is the shipping cost calculated?',
              answer: 'Cost is based on package weight, dimensions, origin, destination, and service type.'
            },
            {
              question: 'Do you offer discounts for bulk shipments?',
              answer: 'Yes, we provide special rates for businesses and bulk shipments. Contact our sales team for details.'
            },
            {
              question: 'What payment methods do you accept?',
              answer: 'We accept cash, credit/debit cards, bank transfers, and mobile payments.'
            },
            {
              question: 'Can I change my delivery address after shipment?',
              answer: 'Address changes are possible before the package is dispatched from our hub. Contact customer support immediately.'
            }
          ].map((faq, index) => (
            <div key={index} className="mb-6 last:mb-0">
              <h3 className="text-xl font-bold mb-2">{faq.question}</h3>
              <p className="text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingPage;