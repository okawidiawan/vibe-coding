import { db } from "../../db";
import { users, sessions } from "../../db/schema";
import { eq } from "drizzle-orm";

export const registerUser = async (name: string, email: string, password: string) => {
  // 1. Cek apakah email sudah ada
  const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (existingUser.length > 0) {
    throw new Error("Email sudah terdaftar");
  }

  // 2. Hash password menggunakan Bun.password (default bcrypt)
  const hashedPassword = await Bun.password.hash(password);

  // 3. Simpan ke database
  await db.insert(users).values({
    name,
    email,
    password: hashedPassword,
  });

  return "OK";
};

export const loginUser = async (email: string, password: string) => {
  // 1. Cari user berdasarkan email
  const userResults = await db.select().from(users).where(eq(users.email, email)).limit(1);

  const user = userResults[0];

  if (!user) {
    throw new Error("Email atau password salah");
  }

  // 2. Verifikasi password
  const isPasswordCorrect = await Bun.password.verify(password, user.password);

  if (!isPasswordCorrect) {
    throw new Error("Email atau password salah");
  }

  // 3. Generate token UUID
  const token = crypto.randomUUID();

  // 4. Simpan session ke database
  await db.insert(sessions).values({
    token,
    userId: user.id,
  });

  return token;
};

export const getCurrentUser = async (token: string) => {
  // 1. Cari data user berdasarkan token di tabel sessions
  const sessionResults = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.token, token))
    .limit(1);

  const user = sessionResults[0];

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
};

export const logout = async (token: string) => {
  // 1. Cek apakah session ada
  const sessionResults = await db
    .select()
    .from(sessions)
    .where(eq(sessions.token, token))
    .limit(1);

  if (sessionResults.length === 0) {
    throw new Error("Unauthorized");
  }

  // 2. Hapus data session dari tabel sessions
  await db.delete(sessions).where(eq(sessions.token, token));

  return "OK";
};
