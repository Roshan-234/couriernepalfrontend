"use client";
export default function ErrorPage({ reset }: { reset: () => void }) { return <div className="container py-20"><h1 className="text-3xl font-bold">We could not load this page.</h1><p className="my-5 text-slate-500">Please try again in a moment. Your saved account and shipment data have not been changed.</p><button className="action" onClick={reset}>Try again</button></div>; }
