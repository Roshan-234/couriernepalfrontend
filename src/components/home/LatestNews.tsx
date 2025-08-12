import Link from 'next/link';

interface NewsItem {
  id: number;
  image: string;
  title: string;
  excerpt: string;
  date: string;
}

const news: NewsItem[] = [
  {
    id: 1,
    image: '/news/news1.jpg',
    title: 'Expanding Our Network to Remote Areas',
    excerpt: "We are now delivering to more locations across Nepal, including remote areas.",
    date: '2023-08-10'
  },
  {
    id: 2,
    image: '/news/news2.jpg',
    title: 'New Express Delivery Service',
    excerpt: "Introducing same-day delivery service in major cities.",
    date: '2023-08-08'
  },
  {
    id: 3,
    image: '/news/news3.jpg',
    title: 'Digital Tracking System Update',
    excerpt: "Enhanced tracking system with real-time updates and notifications.",
    date: '2023-08-05'
  }
];

export default function LatestNews() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Latest News</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Stay updated with our latest developments and services
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news.map((item) => (
            <article key={item.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <img 
                src={item.image} 
                alt={item.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <time className="text-sm text-gray-500">
                  {new Date(item.date).toLocaleDateString()}
                </time>
                <h3 className="text-xl font-bold mb-2 mt-1">{item.title}</h3>
                <p className="text-gray-600 mb-4">{item.excerpt}</p>
                <Link 
                  href={`/blog/${item.id}`}
                  className="text-blue-600 hover:text-blue-800 font-semibold"
                >
                  Read More →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
