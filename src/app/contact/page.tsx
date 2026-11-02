import ContactContent from '@/components/common/ContactContent';
import { getPage, pageMetadata } from '@/lib/content';
export const generateMetadata = () => pageMetadata('/contact');
export default async function Page() { return <ContactContent page={await getPage('/contact')} />; }
