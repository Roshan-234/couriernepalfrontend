import PricingCalculator from '@/components/common/PricingCalculator';
import PageIntro from '@/components/common/PageIntro';
import { getPage, pageMetadata } from '@/lib/content';
export const generateMetadata = () => pageMetadata('/pricing');
export default async function Page() { const page = await getPage('/pricing'); return <div className="container max-w-3xl py-16 sm:py-20"><PageIntro page={page} /><div className="panel"><PricingCalculator /></div></div>; }
