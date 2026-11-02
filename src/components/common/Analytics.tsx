"use client";
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
declare global { interface Window { dataLayer: unknown[]; gtag: (...args: unknown[]) => void; } }
const key = 'analytics-consent-v1';
export default function Analytics({ id, nonce, siteUrl }: { id?: string; nonce: string; siteUrl: string }) {
  const path = usePathname();
  const [choice, setChoice] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [show, setShow] = useState(false);
  const allowedPage = !/^\/(admin|dashboard|auth|protected|tracking)(\/|$)/.test(path);
  useEffect(() => { try { const value = localStorage.getItem(key); setChoice(value); setShow(!value); } catch { setShow(true); } }, []);
  useEffect(() => {
    if (!id || !ready) return;
    const allowed = choice === 'allow' && allowedPage;
    (window as unknown as Record<string, unknown>)[`ga-disable-${id}`] = !allowed;
    window.gtag('consent', 'update', { analytics_storage: allowed ? 'granted' : 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    if (allowed) window.gtag('event', 'page_view', { page_location: siteUrl + path, page_path: path, page_title: document.title, page_referrer: '' });
  }, [path, choice, ready, id, allowedPage, siteUrl]);
  function choose(value: string) {
    try { localStorage.setItem(key, value); } catch { /* Keep preference for this visit. */ }
    setChoice(value); setShow(false);
    if (value === 'deny' && ready) {
      (window as unknown as Record<string, unknown>)[`ga-disable-${id}`] = true;
      window.gtag('consent', 'update', { analytics_storage: 'denied' });
      window.location.reload();
    }
  }
  if (!id || !/^G-[A-Z0-9]+$/.test(id)) return null;
  return <>
    {choice === 'allow' && allowedPage && <Script id="google-analytics" nonce={nonce} src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" onReady={() => {
      window.dataLayer = window.dataLayer || [];
      // gtag requires an arguments object rather than a nested array.
      // eslint-disable-next-line prefer-rest-params -- Google's dataLayer command queue expects IArguments.
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
      window.gtag('js', new Date());
      window.gtag('config', id, { send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false, page_location: siteUrl + path, page_referrer: '' });
      setReady(true);
    }} />}
    {allowedPage && <button type="button" onClick={() => setShow(true)} className="fixed bottom-3 left-3 z-40 rounded-full border bg-white px-3 py-2 text-xs text-slate-600 shadow-sm">Cookie preferences</button>}
    {show && allowedPage && <section aria-label="Optional analytics" className="fixed bottom-4 right-4 z-50 max-w-sm rounded-2xl border bg-white p-6 shadow-xl"><h2 className="font-bold">Optional analytics</h2><p className="my-3 text-sm leading-6 text-slate-600">Allow Google Analytics to help us understand visits to public pages? Shipping details and account activity are excluded.</p><div className="flex gap-3"><button className="action" onClick={() => choose('allow')}>Allow</button><button className="action action-outline" onClick={() => choose('deny')}>Decline</button></div><a className="mt-3 block text-xs underline" href="/privacy">Privacy information</a></section>}
  </>;
}
