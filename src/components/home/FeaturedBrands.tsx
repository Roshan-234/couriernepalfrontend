const brands = [
  '/brands/brand1.png',
  '/brands/brand2.png',
  '/brands/brand3.png',
  '/brands/brand4.png',
  '/brands/brand5.png',
  '/brands/brand6.png'
];

export default function FeaturedBrands() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Trusted By Leading Brands</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We're proud to work with some of the most respected companies in Nepal
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
          {brands.map((brand, index) => (
            <div key={index} className="flex justify-center">
              <img 
                src={brand} 
                alt={`Partner Brand ${index + 1}`} 
                className="h-12 w-auto grayscale hover:grayscale-0 transition duration-300"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
