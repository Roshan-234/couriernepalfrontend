import ManagedPage from '@/components/common/ManagedPage';
import { pageMetadata } from '@/lib/content';

export const generateMetadata = () => pageMetadata('/privacy');

/**
 * The privacy policy is editor-managed, but it is a twelve-section legal
 * document rather than a pair of marketing panels, so it asks for the
 * document layout: one measured column, numbered headings and a contents
 * list. See `ManagedPage`.
 */
export default function Page() {
  return (
    <ManagedPage
      path="/privacy"
      layout="document"
      trail={[{ label: 'Home', href: '/' }, { label: 'Privacy policy' }]}
    />
  );
}
