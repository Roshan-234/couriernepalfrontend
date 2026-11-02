import ManagedPage from '@/components/common/ManagedPage';
import { pageMetadata } from '@/lib/content';
export const generateMetadata = () => pageMetadata('/privacy');
export default function Page() { return <ManagedPage path="/privacy" />; }
