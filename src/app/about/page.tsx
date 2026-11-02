import ManagedPage from '@/components/common/ManagedPage';
import { pageMetadata } from '@/lib/content';
export const generateMetadata = () => pageMetadata('/about');
export default function Page() { return <ManagedPage path="/about" />; }
