import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const name = String(body.name || '').trim();

    if (!email || !password || !name) {
      return NextResponse.json(
        { message: 'Nama, email, dan password wajib diisi' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password minimal 8 karakter' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Email sudah terdaftar' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
      },
    });

    return NextResponse.json(
      { message: 'Registrasi berhasil' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register error:', error);

    return NextResponse.json(
      { message: 'Terjadi kesalahan saat registrasi' },
      { status: 500 }
    );
  }
}
