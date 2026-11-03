import ServiceDetailPage from '@/components/seo/service/ServiceDetailPage';
import type { ServiceDetail } from '@/components/seo/service/types';
import { pageMetadata } from '@/lib/content';
import { CORRIDORS } from '@/lib/seo/business';

export const generateMetadata = () => pageMetadata('/services/international');

const DETAIL: ServiceDetail = {
  path: '/services/international',
  name: 'International shipping',
  serviceType: 'International courier, export freight and customs documentation',
  areaServed: ['Nepal', ...CORRIDORS.map((corridor) => corridor.country)],
  summary:
    'Export courier and freight from Nepal to family, students and buyers overseas, including the commercial invoice and export paperwork each destination requires.',
  covers: [
    {
      title: 'Documents to an overseas institution',
      body:
        'Academic transcripts and certificates for a university application, attested legal papers, visa and embassy documents, and signed contracts. These move as document shipments and need the receiving institution name and department, not just a street address.',
    },
    {
      title: 'Parcels to family and students abroad',
      body:
        'Clothes, spices and dry food, medicine prescribed in Nepal, festival gifts and household items sent to relatives or to a student who has just moved. Every destination restricts a different list, so the contents are reviewed before the shipment is accepted.',
    },
    {
      title: 'Commercial samples and export consignments',
      body:
        'Handicraft, pashmina, felt, tea, coffee and garment samples going to a buyer, and repeat export consignments for businesses that already have an order. These need a commercial invoice and, depending on the product and destination, an export licence or certificate.',
    },
    {
      title: 'Air and sea, documentation included',
      body:
        'Air for anything urgent or light, sea freight for volume that is not in a hurry. Either way our team prepares the export paperwork with you — the commercial invoice, packing list and item descriptions that the customs authority at both ends will read.',
    },
  ],
  suitedTo: [
    'Nepali families sending parcels to relatives in the Gulf, Australia, Japan, Korea, the UK, the USA or Canada',
    'Students posting academic documents to a university or credential service abroad',
    'Exporters of handicraft, pashmina, tea, coffee or garments shipping samples or confirmed orders',
    'Businesses sending spare parts or equipment to an overseas client or back to a manufacturer',
    'Anyone who has had a previous overseas parcel held at customs for a vague contents description',
  ],
  steps: [
    {
      title: 'Tell us the destination and the contents',
      body:
        'Country first, then the item list. Both decide whether a shipment can travel at all, which service is available, and what paperwork is required.',
    },
    {
      title: 'Choose air or sea and get a quote',
      body:
        'Air suits documents and light, urgent parcels. Sea suits volume where the date is flexible. Rates for available destinations are on the pricing page; our team will confirm the final charge for your weight and dimensions.',
    },
    {
      title: 'Prepare the paperwork',
      body:
        'A commercial invoice listing every item with its quantity and value, a packing list, and your ID or company documents. Personal parcels need the same honesty as commercial ones — an understated value is what triggers an inspection.',
    },
    {
      title: 'Pack for a long journey',
      body:
        'An international parcel is handled far more times than a domestic one. Export packing, crating for anything fragile, and timber that meets the destination rules where a wooden case is used.',
    },
    {
      title: 'Export clearance and departure',
      body:
        'The shipment is lodged with Nepali customs and handed to the carrier. You receive the tracking reference once it is accepted.',
    },
    {
      title: 'Import clearance and delivery',
      body:
        'At the destination, the parcel clears import customs before it is delivered. Any duty or tax charged there is set by the destination country and is normally paid by the receiver.',
    },
  ],
  prepare: [
    {
      title: 'The full address in the destination format',
      body:
        'Postcode or ZIP, state or province, apartment or unit number, and the receiver telephone number in international format with an email address. An overseas courier will not guess a missing postcode.',
    },
    {
      title: 'An itemised list with real values',
      body:
        'Every item, its quantity and what it is actually worth. Customs on both sides price the shipment from this list, and a vague line such as "gift items" is the most common reason a parcel is opened and delayed.',
    },
    {
      title: 'Confirmation that nothing is restricted',
      body:
        'Food, medicine, cosmetics, liquids, batteries, seeds, leather and anything made from a protected species are controlled, and the rules differ by country. Check with our team before you pack rather than after.',
    },
    {
      title: 'Who pays the duty at the other end',
      body:
        'Agree it with your receiver first. Import duty and tax are charged by the destination country, and a parcel that nobody is willing to clear comes back at the sender expense.',
    },
  ],
  faqs: [
    {
      question: 'Which countries do you ship to from Nepal?',
      answer:
        'Our regular corridors are the United States, United Kingdom, Australia, Canada, Japan, South Korea, the United Arab Emirates, Qatar, Saudi Arabia, Malaysia, India and China. Other destinations can usually be arranged — ask our team and we will confirm what is available for your route and contents.',
    },
    {
      question: 'Who pays customs duty and tax at the destination?',
      answer:
        'Import duty and tax are set by the destination country and are normally payable by the receiver before delivery. We cannot waive or estimate another country duty, so agree with your receiver in advance that they are willing to clear the shipment.',
    },
    {
      question: 'What paperwork do I need to send a parcel abroad?',
      answer:
        'A commercial invoice listing each item with its quantity and value, a packing list, and your identification. Commercial consignments may also need an export licence, a certificate of origin, or a product-specific certificate depending on the goods and the destination. Our team will tell you which of these apply to your shipment.',
    },
    {
      question: 'Can I send food, medicine or batteries overseas?',
      answer:
        'Sometimes, and it depends entirely on the destination country and the exact item. Dry packaged food is accepted in more places than fresh or homemade food; prescription medicine usually needs the prescription; lithium batteries are restricted in air transport. Tell our team what you want to send before you pack it.',
    },
  ],
  related: [
    {
      href: '/shipping',
      label: 'International shipping hub',
      description: 'Destination guides, corridors and what each country allows.',
    },
    {
      href: '/pricing',
      label: 'International rates',
      description: 'Current charges by destination, weight and service.',
    },
    {
      href: '/tracking',
      label: 'Track an export',
      description: 'Follow a shipment from handover to overseas delivery.',
    },
    {
      href: '/services/packing',
      label: 'Export packing',
      description: 'Crating and protection for a long, multi-handled journey.',
    },
    {
      href: '/contact',
      label: 'Ask about a destination',
      description: 'Check restrictions and paperwork before you pack.',
    },
  ],
};

export default function Page() {
  return <ServiceDetailPage detail={DETAIL} />;
}
