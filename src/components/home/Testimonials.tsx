import { FaQuoteLeft, FaStar } from 'react-icons/fa';

const testimonials = [
  {
    name: 'John Doe',
    company: 'ABC Enterprises',
    content: 'Courier Nepal has been our trusted partner for years. Their service is reliable and their team is very professional.',
    rating: 5
  },
  {
    name: 'Jane Smith',
    company: 'XYZ Solutions',
    content: 'I am extremely satisfied with their international shipping services. Fast delivery and great customer support!',
    rating: 5
  },
  {
    name: 'Robert Johnson',
    company: 'Global Traders',
    content: 'The best courier service in Nepal. Their tracking system is very accurate and their rates are competitive.',
    rating: 4
  }
];

const Testimonials = () => {
  return (
    <section className="py-16">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">What Our Clients Say</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Hear from our satisfied customers about their experience with us
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition"
            >
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <FaStar 
                    key={i} 
                    className={i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'} 
                  />
                ))}
              </div>
              <FaQuoteLeft className="text-gray-300 mb-4" size={24} />
              <p className="text-gray-600 mb-6">{testimonial.content}</p>
              <div>
                <h4 className="font-semibold">{testimonial.name}</h4>
                <p className="text-gray-500">{testimonial.company}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;