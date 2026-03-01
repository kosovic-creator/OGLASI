import { prisma } from '@oglasi/database';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // Validacija
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email i lozinka su obavezni' },
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

    // Kreiraj novog korisnika
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        role: 'KLIENT',
      },
    });

    return NextResponse.json(
      {
        message: 'Registracija uspešna',
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
    console.error('Greška pri registraciji:', error);
    return NextResponse.json(
      { error: 'Greška pri registraciji' },
      { status: 500 }
    );
  }
}
