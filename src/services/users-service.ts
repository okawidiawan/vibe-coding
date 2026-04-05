import { db } from '../../db';
import { users } from '../../db/schema';
import { eq } from 'drizzle-orm';

export const registerUser = async (name: string, email: string, password: string) => {
  // 1. Cek apakah email sudah ada
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    throw new Error('Email sudah terdaftar');
  }

  // 2. Hash password menggunakan Bun.password (default bcrypt)
  const hashedPassword = await Bun.password.hash(password);

  // 3. Simpan ke database
  await db.insert(users).values({
    name,
    email,
    password: hashedPassword,
  });

  return 'OK';
};
