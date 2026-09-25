import Link from "next/link";
export default function Page() {
  return (
    <div className="max-w-2xl">
      <h1 className="mb-8 text-3xl font-bold">Workspace settings</h1>
      <div className="panel">
        <h2 className="text-xl font-bold">Courier Nepal</h2>
        <p className="mt-3 text-sm leading-7 text-slate-500">
          Business configuration, email delivery, and database settings are
          managed on the backend server. Contact your system administrator to
          update these values.
        </p>
        <Link href="/dashboard/profile" className="action mt-6">
          Edit your profile
        </Link>
      </div>
    </div>
  );
}
