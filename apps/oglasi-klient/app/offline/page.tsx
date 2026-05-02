import Link from 'next/link';

export default function OfflinePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-xl border bg-white p-6 shadow-sm text-center">
        <h1 className="text-2xl font-semibold mb-2">Nema interneta</h1>
        <p className="text-gray-600 mb-6">
          Trenutno ste offline. Proverite konekciju i pokusajte ponovo.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md bg-slate-900 text-white px-4 py-2"
        >
          Povratak na pocetnu
        </Link>
      </div>
    </main>
  );
}
