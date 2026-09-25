import Link from "next/link";
export default function NotFound() {
  return (
    <div className="container py-24 text-center">
      <p className="eyebrow text-teal-700">404 · A SMALL DETOUR</p>
      <h1 className="mb-5 mt-4 text-4xl font-bold">
        This page has moved out of reach.
      </h1>
      <p className="mb-8 text-slate-500">
        Let’s get you back on the right route.
      </p>
      <Link href="/" className="action">
        Back to home →
      </Link>
    </div>
  );
}
