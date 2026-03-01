'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function AdminRegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [adminToken, setAdminToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validacija
    if (!email || !password || !confirmPassword || !name || !adminToken) {
      setError('Sva polja su obavezna');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Lozinke se ne poklapaju');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Lozinka mora biti najmanje 6 karaktera');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/admin/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name,
          adminToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Greška pri registraciji');
        return;
      }

      // Uspešna registracija - preusmerite na login
      router.push('/login?registered=true');
    } catch (err) {
      setError('Greška pri konekciji sa serverom');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
            Admin Registracija
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Već imate nalog?{' '}
            <Link
              href="/login"
              className="font-medium text-red-600 hover:text-red-500"
            >
              Prijavite se
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Ime i prezime</Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Ime i prezime"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="email">Email adresa</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="Email adresa"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="password">Lozinka</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                placeholder="Lozinka (min. 6 karaktera)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Potvrdite lozinku</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                placeholder="Potvrdite lozinku"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="adminToken">Admin token</Label>
              <Input
                id="adminToken"
                name="adminToken"
                type="password"
                required
                placeholder="Admin token"
                value={adminToken}
                onChange={(e) => setAdminToken(e.target.value)}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Trebate validan admin token da kreirate administratorski nalog
              </p>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Greška</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? 'Registracija u tijeku...' : 'Admin Registracija'}
          </Button>
        </form>
      </div>
    </div>
  );
}
