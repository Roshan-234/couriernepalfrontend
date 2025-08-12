import { FaQuoteRight } from 'react-icons/fa';

const testimonials = [
  {
    text: "Courier Nepal has been instrumental in helping our e-commerce business grow. Their reliable service and real-time tracking keep our customers happy.",
    author: "Rajesh Sharma",
    position: "CEO, Nepal E-Shop"
  },
  {
    text: "The best courier service in Nepal. Their international shipping is fast and their customer service is excellent.",
    author: "Sarah Wilson",
    position: "Business Owner"
  },
  {
    text: "Very professional and punctual service. I've been using their services for over 2 years and never had any issues.",
    author: "Anita Gurung",
    position: "Online Seller"
  }
];

export default function TestimonialsSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">What Our Clients Say</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Don't just take our word for it - hear what our satisfied customers have to say
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-8 relative">
              <FaQuoteRight className="text-4xl text-blue-100 absolute top-4 right-4" />
              <p className="text-gray-600 mb-6 relative z-10">{testimonial.text}</p>
              <div>
                <p className="font-bold">{testimonial.author}</p>
                <p className="text-gray-500 text-sm">{testimonial.position}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
