import ServiceDetailPage from '@/components/seo/service/ServiceDetailPage';
import type { ServiceDetail } from '@/components/seo/service/types';
import { pageMetadata } from '@/lib/content';

export const generateMetadata = () => pageMetadata('/services/warehouse');

const DETAIL: ServiceDetail = {
  path: '/services/warehouse',
  name: 'Warehouse solutions',
  serviceType: 'Warehousing, inventory storage and order fulfilment',
  areaServed: ['Nepal'],
  summary:
    'Short and longer-term storage in Kathmandu with inbound receiving, recorded inventory, pick and pack, and dispatch straight onto a delivery run.',
  covers: [
    {
      title: 'Short-term and overflow storage',
      body:
        'Space for a consignment that has landed before your own premises are ready, seasonal stock you cannot hold at the shop, or goods parked between a move. Duration is agreed up front rather than open-ended.',
    },
    {
      title: 'Receiving, recording and put-away',
      body:
        'Inbound goods are counted against your delivery note, checked for visible damage, recorded and put away. What arrives is reconciled against what you said would arrive, so a shortage is found on day one.',
    },
    {
      title: 'Pick, pack and dispatch',
      body:
        'Send a release instruction and we pick the items, pack them and put them straight onto a domestic delivery or an export booking, without the stock making an extra trip through your hands.',
    },
    {
      title: 'Stock counts and cross-docking',
      body:
        'Periodic counts so your records and ours agree, and cross-docking for consignments that only need to be broken down and sent on rather than stored.',
    },
  ],
  suitedTo: [
    'Importers whose container has arrived before the distribution plan has',
    'Online sellers with more stock than flat, and no appetite for a lease',
    'Shops holding festival or seasonal lines that only move a few weeks a year',
    'Businesses between premises that need somewhere safe for a month or two',
    'Exporters consolidating several suppliers into one outbound shipment',
  ],
  steps: [
    {
      title: 'Describe the stock',
      body:
        'What it is, how it is packed, how many pallets or cartons, roughly what it is worth, and how long you expect to hold it. Nature of goods matters as much as volume.',
    },
    {
      title: 'Agree space and terms',
      body:
        'Our team confirms what is available, how the space is charged, and the access and release arrangements. Visit the site first if you would rather see where your stock will sit.',
    },
    {
      title: 'Book the inbound',
      body:
        'Tell us when goods will arrive and send the delivery note or packing list ahead. An unannounced delivery waits; a booked one is received.',
    },
    {
      title: 'Receiving and recording',
      body:
        'Items are counted in, discrepancies are raised with you the same day, and the stock is recorded under your account.',
    },
    {
      title: 'Release on instruction',
      body:
        'Send a release request naming the items, the quantity and the destination. Only the people you have named may authorise a release.',
    },
    {
      title: 'Dispatch or collection',
      body:
        'Stock either goes onto one of our delivery runs or is made ready for your own vehicle at an agreed slot.',
    },
  ],
  prepare: [
    {
      title: 'A pallet or carton count with dimensions',
      body:
        'Storage is quoted on the space goods occupy, not only on their weight. Rough dimensions and a count are enough for a first conversation.',
    },
    {
      title: 'The nature of the goods',
      body:
        'Flammables, aerosols, batteries, food, pharmaceuticals and anything needing a controlled temperature are not all storable in the same way. Say so before the lorry is loaded.',
    },
    {
      title: 'How long you need the space',
      body:
        'Two weeks and six months are different products. An honest estimate gets you a better arrangement than an optimistic one.',
    },
    {
      title: 'Who may authorise a release',
      body:
        'Name the people allowed to instruct a dispatch, and how they will be identified. Stock leaves on their word, so the list should be short and current.',
    },
  ],
  faqs: [
    {
      question: 'What kinds of goods can you store?',
      answer:
        'General dry cargo — packaged consumer goods, garments and textiles, handicraft, printed material, spare parts and similar palletised or cartoned stock. Hazardous goods, items needing controlled temperature, and anything perishable need to be discussed with our team before anything is accepted.',
    },
    {
      question: 'How do goods get in and out of storage?',
      answer:
        'Inbound deliveries are booked in advance and received against your packing list. Outbound movement happens on a written release instruction from someone you have named, and the goods either go onto one of our delivery runs or are staged for your own vehicle at an agreed slot.',
    },
    {
      question: 'Can you ship orders directly from the stock you hold?',
      answer:
        'Yes. Stock held with us can be picked, packed and put straight onto a domestic delivery or an export booking, which is the usual arrangement for online sellers who also use our e-commerce service.',
    },
    {
      question: 'How is my stock recorded while it is with you?',
      answer:
        'Goods are counted in against your delivery note, recorded under your account, and counted periodically so your figures and ours can be compared. Discrepancies found at receiving are raised with you rather than absorbed quietly.',
    },
  ],
  related: [
    {
      href: '/services/ecommerce',
      label: 'E-commerce logistics',
      description: 'Dispatch stored stock straight to your buyers.',
    },
    {
      href: '/courier',
      label: 'Domestic courier network',
      description: 'Where stored goods can be sent once released.',
    },
    {
      href: '/shipping',
      label: 'International shipping',
      description: 'Consolidate and export from storage.',
    },
    {
      href: '/pricing',
      label: 'Delivery rates',
      description: 'What onward delivery from storage will cost.',
    },
    {
      href: '/contact',
      label: 'Discuss space',
      description: 'Tell us the volume and the dates you need covered.',
    },
  ],
};

export default function Page() {
  return <ServiceDetailPage detail={DETAIL} />;
}
