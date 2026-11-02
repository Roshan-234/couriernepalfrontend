import ManagedPage from '@/components/common/ManagedPage';
import { pageMetadata } from '@/lib/content';
export const generateMetadata = () => pageMetadata('/services/international');
export default function Page() { return <ManagedPage path="/services/international" />; }
