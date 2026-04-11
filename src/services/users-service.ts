import { db } from '../../db';
import { users, sessions } from '../../db/schema';
import { eq } from 'drizzle-orm';

/**
 * Mendaftarkan pengguna baru ke dalam database.
 * Melakukan pengecekan ketersediaan email dan melakukan hash pada password sebelum disimpan.
 * 
 * @param name - Nama pengguna
 * @param email - Email pengguna yang bersifat unik
 * @param password - Password pengguna dalam bentuk plain text
 * @returns String 'OK' jika registrasi sukses
 * @throws Error 'Email sudah terdaftar' jika email sudah digunakan
 */
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

/**
 * Melakukan proses autentikasi pengguna dengan mencocokkan email dan password.
 * Jika validasi sukses, akan dibuatkan token sesi baru (UUID) yang disimpan di database.
 * 
 * @param email - Email dari akun pengguna
 * @param password - Password akun dalam teks biasa
 * @returns Token sesi (string) yang digunakan sebagai Bearer token
 * @throws Error 'Email atau password salah' jika kredensial tidak cocok
 */
export const loginUser = async (email: string, password: string) => {
  // 1. Cari user berdasarkan email
  const userResults = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  const user = userResults[0];

  if (!user) {
    throw new Error('Email atau password salah');
  }

  // 2. Verifikasi password
  const isPasswordCorrect = await Bun.password.verify(password, user.password);

  if (!isPasswordCorrect) {
    throw new Error('Email atau password salah');
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

/**
 * Mengambil detail profil dari pengguna yang sedang aktif (login).
 * Menggunakan token sesi untuk melakukan query join antara tabel sessions dan users.
 * 
 * @param token - Bearer token dari request header
 * @returns Objek profil pengguna (id, name, email, createdAt)
 * @throws Error 'Unauthorized' jika token tidak ditemukan atau sudah tidak valid
 */
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
    throw new Error('Unauthorized');
  }

  return user;
};
