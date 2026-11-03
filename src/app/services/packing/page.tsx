import ServiceDetailPage from '@/components/seo/service/ServiceDetailPage';
import type { ServiceDetail } from '@/components/seo/service/types';
import { pageMetadata } from '@/lib/content';

export const generateMetadata = () => pageMetadata('/services/packing');

const DETAIL: ServiceDetail = {
  path: '/services/packing',
  name: 'Packing services',
  serviceType: 'Protective packing, crating and export packaging',
  areaServed: ['Nepal'],
  summary:
    'Professional packing, wooden crating and palletising in Kathmandu for fragile, awkward and high-value items before they travel domestically or abroad.',
  covers: [
    {
      title: 'Fragile and breakable items',
      body:
        'Glassware, ceramics, singing bowls, framed thangka and paintings, mirrors, instruments and statues. Each item is wrapped individually, suspended away from the carton walls and cushioned so that nothing touches anything else.',
    },
    {
      title: 'Wooden crates for the difficult things',
      body:
        'Machinery, spare parts, sculpture and anything too heavy or too irregular for a carton gets a crate built around it. Where a crate is going abroad, the timber has to satisfy the destination rules on wood packaging, including ISPM 15 treatment — tell us the country and our team will confirm what is required.',
    },
    {
      title: 'Palletising, strapping and shrink wrap',
      body:
        'Multiple cartons consolidated onto a pallet, strapped and wrapped so the stack arrives as one unit rather than as a slide of loose boxes. Useful for export consignments and for stock moving to a branch.',
    },
    {
      title: 'Moisture protection, labelling and marking',
      body:
        'Sealed liners and desiccant where a shipment will sit in a humid port, plus the orientation arrows, fragile marks and handling labels that tell every person down the chain which way up it goes.',
    },
  ],
  suitedTo: [
    'Anyone sending glass, ceramic or carved items that will be handled many times',
    'Exporters of handicraft, pashmina, metalwork and artwork shipping to a buyer overseas',
    'People moving household goods who want the fragile third of the load done properly',
    'Businesses sending machinery, tooling or spare parts that need a crate',
    'Anyone whose last parcel arrived damaged and would rather not repeat the experience',
  ],
  steps: [
    {
      title: 'Show us the item',
      body:
        'Bring it to the office, or send photographs with rough dimensions and a note on what is fragile. Either is enough to say what the item needs.',
    },
    {
      title: 'Assessment',
      body:
        'We look at what breaks first — a protruding handle, a glued joint, a hollow base, a frame under tension — and at where the item is going, because a domestic road leg and an air export are different journeys.',
    },
    {
      title: 'Agree the packing level',
      body:
        'Cushioned carton, double-boxed, palletised or fully crated. The choice is a trade-off between protection and the volume you will pay to ship, and our team will tell you which it is.',
    },
    {
      title: 'Packing',
      body:
        'The item is wrapped, cushioned, boxed or crated and sealed. You are welcome to watch high-value items being packed, which is also the simplest way to agree on their condition before they leave.',
    },
    {
      title: 'Mark and label',
      body:
        'Handling marks, orientation arrows and the shipment label go on, along with any destination-specific marking the consignment needs.',
    },
    {
      title: 'Handover to the shipment',
      body:
        'The packed item goes straight onto the domestic, express or international service you have chosen, or back to you if you are shipping it another way.',
    },
  ],
  prepare: [
    {
      title: 'An item list with rough dimensions',
      body:
        'Roughly how big and how heavy each piece is. Shipping is charged on volume as well as weight, so dimensions change the quote as much as the packing does.',
    },
    {
      title: 'A note on what is fragile and why',
      body:
        'A thin stem, a loose lid, an antique joint, a battery inside. We will find most of it, but you know the item better than we do.',
    },
    {
      title: 'The destination',
      body:
        'Humidity, journey length, number of handling points and the destination timber rules all change what the packing has to do. Tell us the country before the crate is built, not after.',
    },
    {
      title: 'Anything that must not go inside',
      body:
        'Original documents, keys, batteries and liquids are often tucked into a box for convenience and then cause a problem at a scanner. Hand them over separately.',
    },
  ],
  faqs: [
    {
      question: 'Can you pack items I am shipping through someone else?',
      answer:
        'Yes. Packing is a standalone service — bring the item in, we prepare it, and you can take it away and ship it however you like. Most customers hand it straight back to one of our delivery services afterwards, but that is not a condition.',
    },
    {
      question: 'Do you build wooden crates?',
      answer:
        'Yes, for machinery, sculpture, artwork and anything too heavy or awkward for a carton. If the crate is leaving Nepal, the timber must meet the destination rules on wood packaging material, including ISPM 15 treatment where it applies, so tell our team the destination country before the crate is made.',
    },
    {
      question: 'Will better packing make my shipment more expensive to send?',
      answer:
        'It can, because shipping is charged on the space a parcel occupies as well as its weight, and protective packing adds volume. Our team will tell you when a heavier packing level is genuinely worth the extra, and you can compare the shipping charge on the pricing page.',
    },
    {
      question: 'Can I watch my items being packed?',
      answer:
        'For high-value and fragile pieces, yes — ask when you bring the item in. Seeing it packed is also the clearest way for both sides to agree on the condition of the item before it travels.',
    },
  ],
  related: [
    {
      href: '/services/international',
      label: 'International shipping',
      description: 'Export paperwork and destination rules for packed goods.',
    },
    {
      href: '/services/domestic',
      label: 'Domestic delivery',
      description: 'Send the packed item anywhere in Nepal.',
    },
    {
      href: '/pricing',
      label: 'Shipping rates',
      description: 'What the packed size and weight will cost to send.',
    },
    {
      href: '/tracking',
      label: 'Track a shipment',
      description: 'Follow the item once it has been handed over.',
    },
    {
      href: '/contact',
      label: 'Send us photos',
      description: 'Describe the item and get a packing recommendation.',
    },
  ],
};

export default function Page() {
  return <ServiceDetailPage detail={DETAIL} />;
}
