import ManagedPage from '@/components/common/ManagedPage';
import { pageMetadata } from '@/lib/content';
export const generateMetadata = () => pageMetadata('/services/express');
export default function Page() { return <ManagedPage path="/services/express" />; }
