import TrackingInput from '@/components/tracking/TrackingInput';
import TrackingResult from '@/components/tracking/TrackingResult';
import PageIntro from '@/components/common/PageIntro';
import { getPage, pageMetadata } from '@/lib/content';
export const generateMetadata = () => pageMetadata('/tracking');
export default async function Page() { const page = await getPage('/tracking'); return <div className="container max-w-4xl py-16 sm:py-20"><PageIntro page={page} /><div className="mb-8"><TrackingInput /></div><TrackingResult /></div>; }
