import ServiceDetailPage from '@/components/seo/service/ServiceDetailPage';
import type { ServiceDetail } from '@/components/seo/service/types';
import { pageMetadata } from '@/lib/content';

export const generateMetadata = () => pageMetadata('/services/express');

const DETAIL: ServiceDetail = {
  path: '/services/express',
  name: 'Express delivery',
  serviceType: 'Express and time-critical courier delivery',
  areaServed: ['Nepal'],
  summary:
    'Priority handling for shipments tied to a deadline, with the fastest routing available on the day and a named contact following the consignment.',
  covers: [
    {
      title: 'Priority handling, not a separate network',
      body:
        'An express consignment is booked onto the earliest available departure for its route and is handled ahead of standard traffic at every point. What that means in hours depends on the route, the day and the road, which is why our team confirms it per shipment rather than printing a promise.',
    },
    {
      title: 'Point-to-point inside the Kathmandu Valley',
      body:
        'A dedicated run between two addresses in Kathmandu, Lalitpur or Bhaktapur, where the item does not enter the sorting network at all. Usually the fastest option inside the Valley when the deadline is the same working day.',
    },
    {
      title: 'Deadline documents',
      body:
        'Tender submissions, embassy and visa paperwork, exam and admission documents, court filings and signed contracts. These travel in a sealed pouch and are tracked individually.',
    },
    {
      title: 'Urgent parts and critical items',
      body:
        'A spare that has stopped a production line, a component for a hospital or clinic, a replacement for equipment under warranty. Tell us the deadline first and our team will say what is achievable before you book.',
    },
  ],
  suitedTo: [
    'Anyone facing a submission deadline where arriving late is the same as not arriving',
    'Applicants moving visa, embassy or academic documents between cities',
    'Clinics and hospitals needing a sample, a record or a part moved quickly',
    'Businesses with equipment down and a spare sitting in another district',
    'People who need one confirmed delivery today rather than a cheaper one this week',
  ],
  steps: [
    {
      title: 'Call before you book',
      body:
        'Express availability depends on the route, the day and the departure times still open. One short call tells you whether your deadline is achievable — and saves you paying an express rate for a shipment that could not have made it anyway.',
    },
    {
      title: 'Confirm the cut-off',
      body:
        'Our team gives you the latest handover time for the departure that meets your deadline. Everything else on this page depends on that time.',
    },
    {
      title: 'Have it packed and ready',
      body:
        'Sealed, labelled and waiting before the collection arrives. A parcel still being packed when the rider is at the door is the usual reason an express shipment misses its cut-off.',
    },
    {
      title: 'Priority handover',
      body:
        'The consignment is scanned, flagged as express and routed onto the earliest departure. You get the tracking number at handover.',
    },
    {
      title: 'Watch it move',
      body:
        'Follow the scans on the tracking page. For time-critical work our team will also keep you updated directly rather than leaving you to refresh a page.',
    },
    {
      title: 'Confirmed delivery',
      body:
        'The delivery is recorded against the tracking number, and proof of delivery is available if your deadline needs evidence that the item arrived.',
    },
  ],
  prepare: [
    {
      title: 'The actual deadline, with the time',
      body:
        '"Tomorrow" and "before the counter closes at 2pm tomorrow" lead to different bookings. Give the real deadline and our team can work backwards from it.',
    },
    {
      title: 'A receiver who will answer',
      body:
        'Express delivery dies at a locked door. Confirm your receiver is at the address, reachable, and expecting the delivery before you book.',
    },
    {
      title: 'An exact delivery point',
      body:
        'Floor, office or flat number, the department, and the name of the person who will sign. In a large building this is the difference between arriving at the gate and arriving at the desk.',
    },
    {
      title: 'A backup where documents are involved',
      body:
        'Keep a scan or a certified copy of anything irreplaceable. Express is fast, but no delivery service should be the only copy of a document that cannot be reissued.',
    },
  ],
  faqs: [
    {
      question: 'How fast is express delivery?',
      answer:
        'It depends on the route, the day and the departures still available when you hand the shipment over, so we do not publish a blanket figure. Tell our team your deadline and the destination and they will tell you before you book whether it can be met and what the latest handover time is.',
    },
    {
      question: 'Is express available to every district?',
      answer:
        'No. Priority handling only helps where there is a faster departure to take, so the benefit is greatest between the Kathmandu Valley and the main district centres and smaller on routes served less often. Ask our team about your specific destination.',
    },
    {
      question: 'What is the latest I can hand something over for same-day movement?',
      answer:
        'There is a cut-off for each route and it changes with the departure schedule, so our team confirms it when you call. As a rule, the earlier in the working day you hand over, the more options remain open.',
    },
    {
      question: 'Can I hire a dedicated vehicle for one urgent shipment?',
      answer:
        'Inside the Kathmandu Valley a point-to-point run between two addresses can usually be arranged, which keeps the item out of the sorting network entirely. For longer routes, ask our team what dedicated movement is possible and what it would involve.',
    },
  ],
  related: [
    {
      href: '/services/domestic',
      label: 'Domestic delivery',
      description: 'Standard service when the date is not critical.',
    },
    {
      href: '/pricing',
      label: 'Rates',
      description: 'Compare the charge before choosing priority handling.',
    },
    {
      href: '/tracking',
      label: 'Track an express shipment',
      description: 'Follow the scans from handover to delivery.',
    },
    {
      href: '/courier',
      label: 'Courier network',
      description: 'Which routes and districts are served.',
    },
    {
      href: '/contact',
      label: 'Check a deadline',
      description: 'Call before booking to confirm it can be met.',
    },
  ],
};

export default function Page() {
  return <ServiceDetailPage detail={DETAIL} />;
}
