# Vibe Coding - User Management API

Aplikasi ini merupakan sebuah proyek RESTful API sederhana yang dibangun menggunakan paradigma "vibe-coding". Aplikasi ini memiliki fitur manajemen pengguna dasar seperti registrasi, otentikasi (login/logout), dan pengambilan profil pengguna.

## Teknologi & Library

Aplikasi ini dibangun menggunakan teknologi modern yang sangat cepat dan ringan:
- **Runtime & Package Manager**: [Bun](https://bun.com)
- **Web Framework**: [Elysia](https://elysiajs.com/)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Database**: MySQL
- **Validation**: TypeBox (bawaan Elysia via `t`)
- **Password Hashing**: `bcrypt`
- **Testing**: `bun test` (test runner bawaan Bun)

## Arsitektur & Struktur Folder

Proyek ini menggunakan pemisahan *concern* (*Separation of Concerns*) secara modular:

```text
vibe-coding/
├── db/                    # Konfigurasi Database & Schema
│   ├── index.ts           # Setup koneksi Drizzle ke MySQL
│   └── schema.ts          # Definisi tabel Drizzle ORM
├── src/                   # Source code utama aplikasi
│   ├── routes/            # Definisi endpoint (Controller)
│   │   └── users-route.ts # Rute untuk API users
│   ├── services/          # Business logic dan manipulasi data
│   │   └── users-service.ts
│   └── index.ts           # Entry point aplikasi (Inisiasi server Elysia)
├── test/                  # Automated Tests
│   ├── api.test.ts        # Unit/Integration tests endpoint API
│   └── test-utils.ts      # Utility untuk setup & teardown DB saat test
├── package.json           # Definisi dependencies & script
└── drizzle.config.ts      # Konfigurasi Drizzle Kit (push/studio/generate)
```

## Schema Database

Terdapat 2 entitas utama dalam sistem ini:

1. **`users`**
   - `id` (Serial/PK)
   - `name` (Varchar 255, required)
   - `email` (Varchar 255, required, unique)
   - `password` (Varchar 255, required - Hashed)
   - `createdAt` (Timestamp)
2. **`sessions`**
   - `id` (Serial/PK)
   - `token` (Varchar 255, required)
   - `userId` (BigInt, required, FK to `users.id`)
   - `createdAt` (Timestamp)

## Daftar API yang Tersedia

### Public Endpoint
- `GET /`: Mengecek status server berjalan (Health Check).

### Authentication & User Management
- `POST /api/users`: Endpoint registrasi akun baru. Menerima payload `name`, `email`, dan `password`.
- `POST /api/users/login`: Endpoint login. Menerima payload `email` dan `password` lalu mengembalikan *Authentication Token*.

### Authenticated Endpoint (Memerlukan header `Authorization: Bearer <token>`)
- `GET /api/users/current`: Mengambil profil detail dari user yang sedang login.
- `DELETE /api/users/logout`: Menghapus sesi user terkait (Logout).

## Cara Menjalankan Project

### 1. Prerequisite
- Pastikan [Bun](https://bun.sh/) sudah terinstal di sistem Anda.
- Pastikan MySQL server berjalan di sistem Anda.

### 2. Instalasi
Clone repositori ini, lalu install semua dependencies:

```bash
bun install
```

### 3. Setup Environment
Duplikat file `.env.example` menjadi `.env` lalu sesuaikan konfigurasi host, user, dan nama database MySQL Anda.

### 4. Setup Database
Synchronize schema aplikasi ke database MySQL tanpa perlu setup migration secara manual:

```bash
bun run db:push
```

*(Opsional)* Anda juga bisa membuka Drizzle Studio untuk eksplorasi database di browser:
```bash
bun run db:studio
```

### 5. Jalankan Aplikasi
Jalankan server dalam mode development:

```bash
bun run dev
```

Aplikasi secara default akan berjalan di `http://localhost:3000`.

## Dokumentasi API (Swagger UI)

Aplikasi ini dilengkapi dengan dokumentasi API interaktif menggunakan Swagger UI.
Saat aplikasi berjalan, Anda dapat mengakses dokumentasi tersebut di:

`http://localhost:3000/swagger`

Di halaman ini, Anda dapat melihat seluruh daftar endpoint yang tersedia, skema request/response, serta mencoba API secara langsung.

## Cara Menjalankan Test

Proyek ini telah mencakup unit test secara menyeluruh yang menguji validasi, database, flow registrasi, login, dan autentikasi token. Pastikan database MySQL siap sebelum menjalankan script ini karena data akan di-reset (teardown) setiap test berjalan.

```bash
bun test
```
