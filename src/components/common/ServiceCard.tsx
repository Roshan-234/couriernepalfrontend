import Link from 'next/link';

const ServiceCard = ({ icon, title, description, link }: { 
  icon: React.ReactNode, 
  title: string, 
  description: string, 
  link: string 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="p-8">
        <div className="flex justify-center mb-6 text-blue-600">
          {icon}
        </div>
        <h3 className="text-2xl font-bold text-center mb-4">{title}</h3>
        <p className="text-gray-600 mb-6 text-center">{description}</p>
        <div className="text-center">
          <Link href={link} className="text-blue-600 hover:text-blue-800 font-medium">
            Learn more →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;