import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@oglasi/auth';

export default async function AdminHome() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const user = session.user;

  if (user.role !== 'ADMIN') {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
          <h1 className="text-4xl font-bold mb-8 text-red-500">
            Pristup odbijen
          </h1>
          <p>Nemate administratorske privilegije.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8">Dobrodošli u Admin Panel</h1>
        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
          <p className="mb-2">
            <strong>Email:</strong> {user.email}
          </p>
          <p className="mb-2">
            <strong>Ime:</strong> {user.name || 'N/A'}
          </p>
          <p className="mb-2">
            <strong>Rola:</strong>{' '}
            <span className="text-green-500 font-bold">{user.role}</span>
          </p>
        </div>
      </div>
    </main>
  );
}
