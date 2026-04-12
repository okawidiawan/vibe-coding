# Fitur: Integrasi Swagger UI untuk Dokumentasi API

## Deskripsi Masalah

Saat ini, proyek *User Management API* belum memiliki halaman dokumentasi interaktif yang bisa langsung diuji coba oleh developer atau *client* (seperti aplikasi mobile/frontend) yang ingin menggunakan API kita. 

Untuk mempermudahnya, kita perlu menambahkan **Swagger UI**. Karena kita menggunakan framework [Elysia](https://elysiajs.com/), proses integrasinya sanga mudah menggunakan plugin bawaan yaitu `@elysiajs/swagger`.

---

## Instruksi Implementasi

Tugas ini ditujukan agar kamu (Junior Programmer / AI) bisa mendeploy fitur Swagger langkah demi langkah tanpa merusak logic yang sudah ada. 

Ikuti tahapan di bawah ini dengan berurutan:

### Tahap 1: Instalasi Dependensi
1. Buka terminal di dalam *root directory* proyek (`vibe-coding/`).
2. Jalankan perintah instalasi menggunakan Bun:
   ```bash
   bun add @elysiajs/swagger
   ```

### Tahap 2: Menambahkan Plugin ke dalam Aplikasi Utama
1. Buka file entry point aplikasi yaitu `src/index.ts`.
2. Lakukan import Swagger plugin di bagian atas file:
   ```typescript
   import { swagger } from '@elysiajs/swagger';
   ```
3. Sisipkan plugin Swagger tersebut ke dalam inisialisasi Elysia. Pastikan metode `.use(swagger(...))` dipanggil sebelum mendaftarkan rute (sebelum `.use(usersRoute)` atau di awal-awal *chaining*). Pastikan juga menambahkan `components.securitySchemes` agar tombol *Authorize* (Bearer Token) muncul untuk menguji *endpoint* terpadu (seperti *current user* atau *logout*):
   ```typescript
   export const app = new Elysia()
     .use(swagger({
       documentation: {
         info: {
           title: 'Vibe Coding User API',
           version: '1.0.0',
           description: 'API Documentation for User Management'
         },
         components: {
           securitySchemes: {
             bearerAuth: {
               type: 'http',
               scheme: 'bearer',
               bearerFormat: 'UUID'
             }
           }
         }
       }
     }))
     .use(usersRoute)
     // ... rute lainnya
   ```

### Tahap 3: Memberikan Metadata pada API Route (Opsional namun Sangat Disarankan)
Elysia secara otomatis akan mendeteksi schema `t.Object` yang ada pada `users-route.ts`. Kamu hanya perlu memastikan *summary* dan *description* agar rapi di UI Swagger. 

1. Buka file `src/routes/users-route.ts`
2. Tambahkan properti `detail` pada parameter skema blok rute. Contoh modifikasi di dalam fungsi `.post()`, `.get()`, dan `.delete()`:
   ```typescript
   .post('/users', async ({ body, set }) => {
     // ... logic tetap sama
   }, {
     body: t.Object({ ... }),
     detail: {
       summary: 'Register User',
       tags: ['Authentication']
     }
   })
   ```
3. Lakukan hal serupa seperti memberikan `tags: ['Authentication']` pada endpoint login, current profile, dan logout. Ini bertujuan untuk mengumpulkan/mengelompokkan endpoint di dalam tampilan Swagger.

### Tahap 4: Pengujian Lokal (Verifikasi)
1. Jalankan aplikasi menggunakan perintah development:
   ```bash
   bun run dev
   ```
2. Buka browser dan arahkan ke alamat berikut: `http://localhost:3000/swagger`
3. Verifikasi apakah:
   - Halaman Swagger UI sukses ditampilkan?
   - Endpoint `GET /`, `POST /api/users`, `POST /api/users/login`, dan lain sebagainya terdeteksi dan tercatat dengan benar?
   - Cobalah lakukan *Test Endpoint* (Execute) secara manual melalui Swagger UI tersebut.

### Tahap 5: Update Dokumentasi & Commit
1. Buka file `README.md` dan tambahkan informasi mengenai ketersediaan API documentation.
   Contoh teks yang bisa disisipkan: "Aplikasi menyediakan dokumentasi interaktif. Buka `http://localhost:3000/swagger` pada browser saat aplikasi berjalan untuk melihat dokumentasi API secara lengkap."
2. Lakukan `git add .` dan buat commit dengan format: `feat: add swagger documentation UI`.
3. Push perubahan ke *remote branch*.

---
**Catatan untuk Implementator:** Jika kamu menghadapi kesulitan atau pesan *error* terkait *version mismatch* TypeBox atau Elysia, pastikan versi Elysia dan `@elysiajs/swagger`-nya bersesuaian (`latest`). Baca referensi resmi di [Elysia Swagger Plugin](https://elysiajs.com/plugins/swagger.html).
