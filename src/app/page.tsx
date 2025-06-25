import HeroSection from '@/components/home/HeroSection';
import ServiceCards from '@/components/home/ServiceCards';
import TrackingSection from '@/components/home/TrackingSection';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import Testimonials from '@/components/home/Testimonials';

export default function Home() {
  return (
    <>
      <HeroSection />
      <ServiceCards />
      <TrackingSection />
      <WhyChooseUs />
      <Testimonials />
    </>
  );
}