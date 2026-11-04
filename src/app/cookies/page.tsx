import ManagedPage from '@/components/common/ManagedPage';
import { pageMetadata } from '@/lib/content';

export const generateMetadata = () => pageMetadata('/cookies');

/**
 * What each cookie category does, and how to change the answer. Reached
 * from the banner, from the preferences dialog and from the footer, so the
 * page a visitor is sent to actually explains what they are agreeing to.
 */
export default function Page() {
  return (
    <ManagedPage
      path="/cookies"
      layout="document"
      trail={[{ label: 'Home', href: '/' }, { label: 'Cookie notice' }]}
    />
  );
}
