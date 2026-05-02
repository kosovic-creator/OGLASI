import { prisma } from '@oglasi/database';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

// Admin token - trebate promeniti ovo u production-u
const ADMIN_REGISTRATION_TOKEN = process.env.ADMIN_REGISTRATION_TOKEN || 'admin-secret-token-change-me';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, adminToken } = body;

    console.log('Admin registracija pokušaj:', { email, name, hasPassword: !!password, hasToken: !!adminToken });
    console.log('Očekivani token:', ADMIN_REGISTRATION_TOKEN);
    console.log('Primljeni token:', adminToken);

    // Validacija tokena
    if (!adminToken || adminToken !== ADMIN_REGISTRATION_TOKEN) {
      console.log('Token validacija neuspela');
      return NextResponse.json(
        { error: 'Nevažeći admin token' },
        { status: 403 }
      );
    }

    // Validacija ostalih polja
    if (!email || !password || !name) {
      console.log('Validacija polja neuspela:', { email: !!email, password: !!password, name: !!name });
      return NextResponse.json(
        { error: 'Email, lozinka i ime su obavezni' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Lozinka mora biti najmanje 6 karaktera' },
        { status: 400 }
      );
    }

    // Proverite da li korisnik već postoji
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Korisnik sa ovim emailom već postoji' },
        { status: 409 }
      );
    }

    // Heširaj lozinku
    const hashedPassword = await bcrypt.hash(password, 12);

    // Kreiraj novog administratora
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'ADMIN',
      },
    });

    return NextResponse.json(
      {
        message: 'Admin registracija uspešna',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Greška pri admin registraciji:', error);
    return NextResponse.json(
      { error: 'Greška pri registraciji' },
      { status: 500 }
    );
  }
}
