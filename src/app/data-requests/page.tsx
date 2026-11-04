import ManagedPage from '@/components/common/ManagedPage';
import { pageMetadata } from '@/lib/content';

export const generateMetadata = () => pageMetadata('/data-requests');

/** How to ask for a copy of your data, its correction or its deletion. */
export default function Page() {
  return (
    <ManagedPage
      path="/data-requests"
      layout="document"
      trail={[{ label: 'Home', href: '/' }, { label: 'Data requests' }]}
    />
  );
}
