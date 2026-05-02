'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import {
  adminRegisterSchema,
  mapZodErrorsToFields,
  resetValidationState,
} from '@oglasi/auth/schemas';

export const dynamic = 'force-dynamic';

export default function AdminRegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [adminToken, setAdminToken] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetValidationState(setErrors, setGeneralError);
    setLoading(true);

    // Validacija sa Zod
    const validationResult = adminRegisterSchema.safeParse({
      email,
      password,
      confirmPassword,
      name,
      adminToken,
    });

    if (!validationResult.success) {
      setErrors(mapZodErrorsToFields(validationResult.error));
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
        setGeneralError(data.error || 'Greška pri registraciji');
        return;
      }

      // Uspešna registracija - preusmerite na login
      router.push('/login?registered=true');
    } catch (err) {
      setGeneralError('Greška pri konekciji sa serverom');
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

        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Ime i prezime</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Ime i prezime"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email adresa</Label>
              <Input
                id="email"
                name="email"
                type="text"
                placeholder="Email adresa"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Lozinka</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Lozinka (min. 6 karaktera)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={errors.password ? 'border-red-500' : ''}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Potvrdite lozinku</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Potvrdite lozinku"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={errors.confirmPassword ? 'border-red-500' : ''}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            <div>
              <Label htmlFor="adminToken">Admin token</Label>
              <Input
                id="adminToken"
                name="adminToken"
                type="password"
                placeholder="Admin token"
                value={adminToken}
                onChange={(e) => setAdminToken(e.target.value)}
                className={errors.adminToken ? 'border-red-500' : ''}
              />
              {errors.adminToken && (
                <p className="mt-1 text-sm text-red-500">{errors.adminToken}</p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Trebate validan admin token da kreirate administratorski nalog
              </p>
            </div>
          </div>

          {generalError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Greška</AlertTitle>
              <AlertDescription>{generalError}</AlertDescription>
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
