import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .email('Unesite validnu email adresu')
    .min(1, 'Email je obavezna'),
  password: z
    .string()
    .min(1, 'Lozinka je obavezna')
    .min(6, 'Lozinka mora biti najmanje 6 karaktera'),
});

export const registerSchema = z
  .object({
    email: z
      .string()
      .email('Unesite validnu email adresu')
      .min(1, 'Email je obavezna'),
    name: z
      .string()
      .min(1, 'Ime je obavezna')
      .min(2, 'Ime mora biti najmanje 2 karaktera')
      .max(50, 'Ime ne sme biti duže od 50 karaktera'),
    password: z
      .string()
      .min(1, 'Lozinka je obavezna')
      .min(6, 'Lozinka mora biti najmanje 6 karaktera')
      .min(1, 'Lozinka je obavezna'),
    //   .regex(
    //     /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    //     'Lozinka mora sadržavati najmanje jedno veliko slovo, malo slovo i brojku'
    //   ),
    confirmPassword: z
      .string()
      .min(1, 'Potvrda lozinke je obavezna'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Lozinke se ne poklapaju',
    path: ['confirmPassword'],
  });

export const adminRegisterSchema = registerSchema.extend({
  adminToken: z
    .string()
    .min(1, 'Admin token je obavezna')
    .min(10, 'Token mora biti validan'),
});

export function mapZodErrorsToFields(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  error.issues.forEach((issue) => {
    const path = issue.path[0];
    if (typeof path === 'string') {
      fieldErrors[path] = issue.message;
    }
  });

  return fieldErrors;
}

export function resetValidationState(
  setErrors: (errors: Record<string, string>) => void,
  setGeneralError: (message: string) => void
): void {
  setErrors({});
  setGeneralError('');
}

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type AdminRegisterInput = z.infer<typeof adminRegisterSchema>;
