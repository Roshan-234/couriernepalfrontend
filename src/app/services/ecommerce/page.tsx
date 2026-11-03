import ServiceDetailPage from '@/components/seo/service/ServiceDetailPage';
import type { ServiceDetail } from '@/components/seo/service/types';
import { pageMetadata } from '@/lib/content';

export const generateMetadata = () => pageMetadata('/services/ecommerce');

const DETAIL: ServiceDetail = {
  path: '/services/ecommerce',
  name: 'E-commerce logistics',
  serviceType: 'E-commerce order fulfilment and last-mile delivery',
  areaServed: ['Nepal'],
  summary:
    'Scheduled pickup, last-mile delivery to buyers, returns handling and order reconciliation for online sellers shipping from Nepal.',
  covers: [
    {
      title: 'Scheduled pickup from your side',
      body:
        'A recurring collection from your shop, flat or warehouse at an agreed time, so you are not carrying the day orders to a counter yourself. Volume and route decide how often collection can run.',
    },
    {
      title: 'Last-mile delivery and buyer contact',
      body:
        'Delivery to the buyer address, with the rider calling ahead. Failed attempts are retried and the buyer is contacted rather than the order simply being marked undelivered.',
    },
    {
      title: 'Cash on delivery and remittance',
      body:
        'Collecting payment from the buyer at the door is available on routes where we operate it. How often the collected amount is remitted to you, and on what terms, is agreed per account — ask our team for the arrangement that fits your volume.',
    },
    {
      title: 'Returns and reconciliation',
      body:
        'Refused, undeliverable and returned orders come back to you with a reason recorded against each one, and your orders are reconciled against what was delivered, returned and collected rather than left for you to match by hand.',
    },
  ],
  suitedTo: [
    'Instagram, Facebook and TikTok sellers shipping a handful of orders a day',
    'Marketplace and own-site merchants who need one delivery partner instead of several riders',
    'Brands that ship repeat orders to the same districts every week',
    'Sellers whose main cost is time spent at a counter rather than the delivery charge itself',
    'Businesses that need a record of what was delivered, returned and collected for their accounts',
  ],
  steps: [
    {
      title: 'Talk through your volume and routes',
      body:
        'Daily or weekly order count, which districts your buyers are in, average parcel size, and whether you need cash on delivery. This decides what we can offer and at what rate.',
    },
    {
      title: 'Set up the account',
      body:
        'We agree the pickup window, the rate for your routes, the returns rule and who at each side is the contact when an order goes wrong.',
    },
    {
      title: 'Send us the day orders',
      body:
        'Hand over your parcels with a manifest listing each order, the buyer name, address, mobile number and any amount to collect. One file or one sheet, not a message thread.',
    },
    {
      title: 'Pickup and induction',
      body:
        'The collection runs at the agreed window. Each parcel is scanned in, so from that point every order has a tracking number you and the buyer can follow.',
    },
    {
      title: 'Delivery attempts',
      body:
        'Riders deliver and call ahead. Where a buyer is unreachable, the attempt is logged and retried before the order is treated as a return.',
    },
    {
      title: 'Reconcile and repeat',
      body:
        'You receive the outcome of each order, returns come back on the next collection, and any collected cash is remitted on the agreed cycle.',
    },
  ],
  prepare: [
    {
      title: 'A clean order file',
      body:
        'Buyer name, full address with ward and landmark, mobile number, order reference and amount to collect. Addresses copied straight from a chat message are the main reason an e-commerce parcel fails on the first attempt.',
    },
    {
      title: 'Parcels already packed and labelled',
      body:
        'Sealed, labelled with the order reference, and sturdy enough for a loaded rider bag. We can pack for you, but a collection runs faster when the parcels are handover-ready.',
    },
    {
      title: 'A returns policy you have decided on',
      body:
        'How many delivery attempts before a return, whether the buyer may open the parcel before paying, and who absorbs the return leg. Decide this before the first order, not during the first dispute.',
    },
    {
      title: 'One named contact on your side',
      body:
        'Someone reachable during delivery hours who can confirm an address or authorise a second attempt. A single contact resolves in minutes what a shared inbox resolves in days.',
    },
  ],
  faqs: [
    {
      question: 'Do you collect from my warehouse, or do I drop orders off?',
      answer:
        'Either. Most sellers use a scheduled collection from their shop or storage space, which is agreed when the account is set up. If your volume is small or irregular, dropping the orders at the counter may suit you better.',
    },
    {
      question: 'Can you collect cash on delivery from my buyers?',
      answer:
        'Yes, on routes where we operate cash collection. The remittance cycle and any handling terms are agreed per account rather than fixed, so ask our team what applies to your volume and destinations.',
    },
    {
      question: 'What happens to an order the buyer refuses or never answers for?',
      answer:
        'The delivery is attempted again and the buyer is contacted on the number in your order file. If it still cannot be delivered, the parcel is returned to you on a later collection with the reason recorded against the order.',
    },
    {
      question: 'Is there a minimum number of orders to open an account?',
      answer:
        'There is no fixed threshold published here. Volume affects the rate and how often collection can run, so tell our team your current and expected order count and they will say what is workable.',
    },
  ],
  related: [
    {
      href: '/pricing',
      label: 'Delivery rates',
      description: 'Current charges by route, weight and parcel size.',
    },
    {
      href: '/courier',
      label: 'Domestic courier network',
      description: 'The districts your buyers can be reached in.',
    },
    {
      href: '/services/warehouse',
      label: 'Warehouse solutions',
      description: 'Store stock with us and dispatch straight from it.',
    },
    {
      href: '/tracking',
      label: 'Order tracking',
      description: 'A tracking number your buyer can follow themselves.',
    },
    {
      href: '/contact',
      label: 'Open a seller account',
      description: 'Talk through volume, routes and collection times.',
    },
  ],
};

export default function Page() {
  return <ServiceDetailPage detail={DETAIL} />;
}
