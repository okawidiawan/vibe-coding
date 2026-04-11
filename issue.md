# Issue: Buat API Get Current User

## Deskripsi Masalah
Kita membutuhkan endpoint API untuk mendapatkan data profil dari *user* yang saat ini sedang login. Klien atau Frontend akan mengirimkan *Session Token* sebagai bentuk autentikasi, dan sistem harus mengembalikan data detail dari *user* tersebut.

## Spesifikasi API

- **Endpoint:** `GET /api/users/current`
- **Headers:** 
  - `Authorization: Bearer <token>`
*(Catatan: `<token>` adalah token UUID yang sudah ada di tabel `sessions` saat proses login)*

**Response Success (200 OK):**
```json
{
    "data": {
        "id": 1,
        "name": "Oka",
        "email": "oka@localhost",
        "created_at": "timestamp"
    }
}
```

**Response Error (401 Unauthorized):**
Misalnya karena token tidak dikirim, token salah, atau sesi sudah kedaluwarsa/hilang.
```json
{
    "error": "Unauthorized"
}
```

---

## Struktur File Terkait
Di dalam folder `src/`, kita sudah membagi logic ke dalam *routes* dan *services*. Ikuti letak foldernya:
- **Routes:** berisi konfigurasi ElysiaJS (contoh: `src/routes/users-route.ts`)
- **Services:** berisi *business logic* dan query Drizzle ORM ke database (contoh: `src/services/users-service.ts`)

---

## Tahapan Implementasi

Untuk mengimplementasikan fitur ini, harap kerjakan seluruh tahapan di bawah secara berurutan:

### Tahap 1: Ekstraksi Token (Opsional jika sudah ada)
**(File: `src/routes/users-route.ts`)**
1. Periksa apakah sudah ada logic / `derive` di *route* Elysia untuk mengekstrak token dari header `Authorization`. Jika belum, tambahkan `.derive()` middleware untuk memisahkan string `Bearer ` dan mendapatkan *pure* token-nya agar dapat digunakan di berbagai endpoint dengan mudah.

### Tahap 2: Menambahkan Business Logic di Service
**(File: `src/services/users-service.ts`)**
1. Buat dan *export* satu *async function* baru, misalnya bernama `getCurrentUser(token: string)`.
2. Di dalam fungsi tersebut, buat query pencarian database menggunakan *drizzle-orm*:
   - Cari data di tabel `sessions` dengan melakukan pencocokan (`eq`) kepada nilai token parameter.
   - Karena tabel `sessions` hanya memiliki `userId`, lakukan *JOIN* (`innerJoin`) dengan tabel `users` untuk mendapatkan field yang dibutuhkan (`id`, `name`, `email`, `createdAt` / `created_at`).
   - Limit pencarian ke 1 data (*limit 1*).
3. Buat kondisi validasi:
   - Jika query return data yang kosong/tidak ada, lakukan `throw new Error('Unauthorized')`.
4. Jika query berhasil dan data ditemukan, kembalikan data *user* tersebut.

### Tahap 3: Mendaftarkan Endpoint dan Validasi
**(File: `src/routes/users-route.ts`)**
1. Daftarkan _sub-route_ baru menggunakan `.get('/users/current', async ({ token, set }) => { ... })` mengikuti bentuk parameter Elysia.
2. Di dalamnya, tambahkan logic *try...catch*:
   - Jika `token` kosong, langsung kembalikan status `401` dengan JSON `error: "Unauthorized"`.
   - Panggil fungsi `getCurrentUser(token)` yang sudah dikerjakan di Tahap 2.
   - Sesuai Response Body _Success_, kembalikan data _user_ menggunakan properti `data`, yaitu `return { data: user }`.
   - Di dalam blog `catch (error)`, pastikan jika error message bernada *Unauthorized*, maka atur `set.status = 401` dan kembalikan JSON konfigurasinya.
3. Tetapkan TypeBox validasi pada parameter ketiga dari method HTTP untuk memberikan schema yang baik, dan gunakan Swagger metadata (tambahkan tag `User Management` atau sejenisnya) supaya muncul cantik di Swagger UI.

### Tahap 4: Pengujian Endpoint
Silakan lakukan pengetesan manual setelah koding selesai.
1. Jalankan project dengan `bun run dev` (atau sesuaikan dengan script package).
2. Login dahulu ke dalam sistem dengan `POST /api/users/login` dan catat/copy token yang dikembalikan.
3. Gunakan *cURL* / Postman / SwaggerUI di browser untuk mencoba _GET /api/users/current_ dan set header `Authorization: Bearer <TOKEN_TERTULIS>`.
4. Pastikan data profil JSON dikembalikan dengan benar.
5. Coba hit tanpa Header Authorization, pastikan keluar pesan *Unauthorized* beserta HTTP *status code* 401.
