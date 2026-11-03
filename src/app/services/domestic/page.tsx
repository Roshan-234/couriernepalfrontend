import ServiceDetailPage from '@/components/seo/service/ServiceDetailPage';
import type { ServiceDetail } from '@/components/seo/service/types';
import { pageMetadata } from '@/lib/content';

export const generateMetadata = () => pageMetadata('/services/domestic');

const DETAIL: ServiceDetail = {
  path: '/services/domestic',
  name: 'Domestic delivery',
  serviceType: 'Domestic courier and parcel delivery',
  areaServed: ['Nepal'],
  summary:
    'Door-to-door courier for documents, parcels and business consignments moving between districts inside Nepal, booked online and followed with a tracking number.',
  covers: [
    {
      title: 'Documents and small parcels',
      body:
        'Transcripts and academic papers, bank and legal documents, contracts awaiting a signature, ID cards, spare keys and anything else that is small, flat and time-sensitive. Document shipments travel in a sealed pouch rather than loose in a carton.',
    },
    {
      title: 'Household and personal items',
      body:
        'Clothes and bedding sent home, kitchen items, books, electronics and gifts between family members in different districts. Fragile items can be prepared through our packing service before they are handed over.',
    },
    {
      title: 'Business and inter-branch consignments',
      body:
        'Stock moving from a Kathmandu warehouse to a shop in another district, printed material, samples for a client, and files or equipment moving between offices of the same company on a regular schedule.',
    },
    {
      title: 'Kathmandu Valley and the districts beyond',
      body:
        'Collection and delivery inside Kathmandu, Lalitpur and Bhaktapur, and onward movement along the national road network to district centres such as Pokhara, Chitwan, Butwal, Biratnagar, Birgunj, Nepalgunj and Dhangadhi. Ask our team to confirm the current reach for a hill or remote ward before you book.',
    },
  ],
  suitedTo: [
    'Students and graduates sending transcripts, mark sheets or attested documents to another district',
    'Families sending clothes, food staples or gifts to relatives outside the Valley',
    'Shops and small businesses restocking a branch or sending goods to a customer',
    'Offices that move signed paperwork between a head office and a field site',
    'Anyone who wants a tracking number rather than handing a parcel to a passing bus',
  ],
  steps: [
    {
      title: 'Check the rate for your route',
      body:
        'Look up the origin and destination district on the pricing page, or ask our team. The charge depends on the route and on the size and weight of what you are sending.',
    },
    {
      title: 'Book the shipment',
      body:
        'Create the shipment online or call the office. Give the sender and receiver details, describe the contents honestly and say whether you want collection or will drop the parcel off.',
    },
    {
      title: 'Pack it properly',
      body:
        'Use a carton that is not already weakened, pad anything that can move inside, and tape every seam. If you would rather not do it yourself, our packing team can prepare the item first.',
    },
    {
      title: 'Hand over and get a tracking number',
      body:
        'At collection or at the counter, the consignment is weighed, measured and labelled. You receive a tracking number at that point — keep it, and send a copy to the person receiving the parcel.',
    },
    {
      title: 'Follow the journey',
      body:
        'Enter the tracking number on the tracking page to see the latest scan. If a delivery attempt fails because nobody is reachable, our team will try to contact the receiver on the number you supplied.',
    },
    {
      title: 'Delivery and confirmation',
      body:
        'The parcel is handed to the receiver or to someone they have authorised, and the delivery is recorded against the tracking number.',
    },
  ],
  prepare: [
    {
      title: 'A reachable mobile number for the receiver',
      body:
        'This is the single most common cause of a delayed domestic delivery. A number that is switched off or belongs to someone who has moved will stall a parcel that is already in the right district.',
    },
    {
      title: 'An address written the way Nepal is navigated',
      body:
        'Municipality or rural municipality, ward number, tole, and a landmark a rider will recognise — a school, a chowk, a petrol pump, a named shop. Street numbering is not reliable outside the Valley.',
    },
    {
      title: 'An honest description of the contents',
      body:
        'Tell us what is inside. Liquids, powders, aerosols, batteries and perishable food are handled differently or cannot travel at all, and a wrong description is what causes a parcel to be stopped mid-route.',
    },
    {
      title: 'Inner packing, not just an outer box',
      body:
        'If the contents shift when you shake the carton, they will shift on a lorry for eight hours. Fill the gaps before you seal it.',
    },
  ],
  faqs: [
    {
      question: 'Which parts of Nepal can you deliver to?',
      answer:
        'We move shipments across the Kathmandu Valley and to district centres connected by the national road network, with onward delivery to surrounding wards. Reach to remote hill and mountain wards changes with the season and the road condition, so ask our team to confirm a specific destination before you book.',
    },
    {
      question: 'Can you collect the parcel, or do I have to bring it to an office?',
      answer:
        'Both are possible. You can request collection when you create the shipment, or hand the parcel in at the counter. Collection availability depends on your location and the time of day, so book it in advance rather than on the hour you need it.',
    },
    {
      question: 'How do I write a delivery address for a district outside the Valley?',
      answer:
        'Give the municipality or rural municipality, the ward number, the tole, and a landmark that a local rider will know, along with the receiver mobile number. A landmark is worth more than a street name in most of Nepal.',
    },
    {
      question: 'How much does a domestic delivery cost?',
      answer:
        'The charge depends on the route, the weight and the size of the parcel. The current rates are on the pricing page; confirm the final charge with our team before booking if your item is unusually large or heavy.',
    },
  ],
  related: [
    {
      href: '/pricing',
      label: 'Domestic rates',
      description: 'Current charges by route, weight and parcel size.',
    },
    {
      href: '/tracking',
      label: 'Track a parcel',
      description: 'Enter a tracking number to see the latest scan.',
    },
    {
      href: '/courier',
      label: 'Courier services in Nepal',
      description: 'The wider domestic network, routes and pickup options.',
    },
    {
      href: '/services/packing',
      label: 'Packing services',
      description: 'Have fragile or awkward items prepared before handover.',
    },
    {
      href: '/services/express',
      label: 'Express delivery',
      description: 'Priority handling when the date cannot move.',
    },
  ],
};

export default function Page() {
  return <ServiceDetailPage detail={DETAIL} />;
}
