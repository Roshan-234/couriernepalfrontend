import { Metadata } from 'next';
import { Section } from '@/components/layout/Section';
import HomeCarousel from '@/components/home/HomeCarousel';
import ServiceCards from '@/components/home/ServiceCards';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import StatsSection from '@/components/home/StatsSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import FeaturedBrands from '@/components/home/FeaturedBrands';
import LatestNews from '@/components/home/LatestNews';
import DownloadApp from '@/components/home/DownloadApp';

export const metadata: Metadata = {
  title: 'Moonlight Freight - Fast & Reliable Courier Services in Nepal',
  description: 'Domestic and international courier services in Nepal. Fast, reliable, and secure delivery solutions for businesses and individuals.',
};

export default function Home() {
  return (
    <main>
      <HomeCarousel />
      
      <Section 
        title="Our Services"
        description="Experience comprehensive logistics solutions tailored to meet your needs"
        centered
        lightBackground
      >
        <ServiceCards />
      </Section>

      <Section>
        <WhyChooseUs />
      </Section>

      <Section lightBackground>
        <StatsSection />
      </Section>

      <Section 
        title="What Our Clients Say"
        description="Trusted by thousands of businesses and individuals across Nepal"
        centered
      >
        <TestimonialsSection />
      </Section>

      <Section lightBackground>
        <FeaturedBrands />
      </Section>

      <Section 
        title="Latest News & Updates"
        description="Stay informed about our services and industry insights"
        centered
      >
        <LatestNews />
      </Section>

      <Section lightBackground>
        <DownloadApp />
      </Section>
    </main>
  );
}