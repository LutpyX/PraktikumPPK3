# 🐛 LAPORAN ERROR & TEMUAN — DUITku

**Tanggal Review:** 30 September 2026
**Reviewer:** Code Review Otomatis
**Status:** Dokumen referensi untuk programmer — TIDAK ADA KODE YANG DIUBAH

---

## ❌ ERROR KRITIS (Harus diperbaiki segera)

### ERR-01: PostgreSQL Tidak Berjalan (ECONNREFUSED)
- **Severity:** 🔴 KRITIS — Aplikasi tidak bisa digunakan sama sekali
- **File:** Semua file yang menggunakan [`lib/db.ts`](file:///c:/vscdddd/Kuliah/PPK/PraktikumPPK3/duitku-next/lib/db.ts)
- **Error Log:**
  ```
  Error: connect ECONNREFUSED ::1:5432
  Error: connect ECONNREFUSED 127.0.0.1:5432
  ```
- **Penyebab:** PostgreSQL tidak sedang berjalan di komputer lokal, atau file `.env` belum dikonfigurasi dengan benar.
- **Cara Perbaiki:**
  1. Pastikan PostgreSQL sudah terinstal dan service-nya **berjalan** (cek via `pg_isready` atau Task Manager)
  2. Atau jalankan via Docker: `docker-compose up -d` di folder `duitku-next/`
  3. Buat file `.env` di `duitku-next/` (BELUM ADA) dengan isi:
     ```env
     DATABASE_URL=postgresql://duitku:duitku_dev@localhost:5432/duitku
     SESSION_SECRET=ganti-dengan-string-rahasia-minimal-32-karakter
     ```
  4. Setelah database jalan, hit `http://localhost:3000/api/seed` untuk membuat tabel dan data dummy

### ERR-02: File `.env` Tidak Ada
- **Severity:** 🔴 KRITIS
- **File:** Root folder `duitku-next/`
- **Penyebab:** Tidak ditemukan file `.env` di proyek (sudah benar di-gitignore, tapi tidak ada `.env.example` sebagai template)
- **Dampak:** Variabel `DATABASE_URL` dan `SESSION_SECRET` tidak terdefinisi → koneksi database gagal & JWT secret kosong
- **Cara Perbaiki:**
  1. Buat file `duitku-next/.env` berdasarkan konfigurasi `docker-compose.yml`:
     ```env
     DATABASE_URL=postgresql://duitku:duitku_dev@localhost:5432/duitku
     SESSION_SECRET=rahasia-kunci-jwt-anda-minimal-32-karakter
     ```
  2. *(Rekomendasi)* Buat file `.env.example` agar anggota tim lain tahu variabel apa saja yang dibutuhkan

---

## ⚠️ ERROR SEDANG (Sebaiknya diperbaiki)

### ERR-03: `CREATE TABLE IF NOT EXISTS` di Dalam API Route Dashboard
- **Severity:** 🟡 SEDANG
- **File:** [`app/dashboard/page.tsx`](file:///c:/vscdddd/Kuliah/PPK/PraktikumPPK3/duitku-next/app/dashboard/page.tsx#L12-L23) (baris 12–23) dan [`app/api/dashboard/route.ts`](file:///c:/vscdddd/Kuliah/PPK/PraktikumPPK3/duitku-next/app/api/dashboard/route.ts#L20-L32) (baris 20–32)
- **Masalah:** `CREATE TABLE IF NOT EXISTS transactions (...)` dijalankan **setiap kali** halaman dashboard dimuat atau API dashboard dipanggil. Ini adalah DDL statement yang seharusnya hanya dijalankan sekali saat setup, bukan setiap request.
- **Dampak:** Overhead query yang tidak perlu pada setiap page load. Bisa menyebabkan *locking* di PostgreSQL jika banyak user akses bersamaan.
- **Cara Perbaiki:** Hapus blok `CREATE TABLE IF NOT EXISTS` dari kedua file tersebut. Tabel sudah dibuat melalui migration (`002_create_transactions.sql`) dan seed (`/api/seed`).

### ERR-04: Duplikasi Logika Dashboard (SSR + API Route)
- **Severity:** 🟡 SEDANG
- **File:**
  - [`app/dashboard/page.tsx`](file:///c:/vscdddd/Kuliah/PPK/PraktikumPPK3/duitku-next/app/dashboard/page.tsx#L8-L88) — fungsi `getDashboardData()` (baris 8–88)
  - [`app/api/dashboard/route.ts`](file:///c:/vscdddd/Kuliah/PPK/PraktikumPPK3/duitku-next/app/api/dashboard/route.ts) — endpoint GET (seluruh file)
- **Masalah:** Query SQL yang sama (total income, total expense, recent transactions) ditulis **dua kali** — sekali di server component `page.tsx` dan sekali lagi di API route `route.ts`. Jika ada perubahan logika, harus diubah di dua tempat.
- **Cara Perbaiki:** Buat satu fungsi helper bersama (misal di `lib/dashboard.ts`) yang digunakan oleh kedua file. Atau hapus `getDashboardData()` dari `page.tsx` dan gunakan `DashboardClient` untuk fetch data sepenuhnya dari API route.

### ERR-05: Fallback Test User di API Dashboard
- **Severity:** 🟡 SEDANG
- **File:** [`app/api/dashboard/route.ts`](file:///c:/vscdddd/Kuliah/PPK/PraktikumPPK3/duitku-next/app/api/dashboard/route.ts#L10-L11) (baris 10–11)
- **Masalah:**
  ```typescript
  if (!user && process.env.NODE_ENV !== "production") {
      user = { id: 1, name: "Test User", email: "test@mail.com" };
  }
  ```
  Hardcoded fallback user ID di development mode bisa menyebabkan kebingungan saat testing multi-user. Juga, field `created_at` tidak ada di fallback object ini.
- **Cara Perbaiki:** Hapus fallback ini. Gunakan login sungguhan saat development. Jika ingin dipertahankan, tambahkan komentar jelas bahwa ini hanya untuk debugging dan HARUS dihapus sebelum production.

---

## 💡 TEMUAN RINGAN (Nice to fix)

### ERR-06: Navigasi ke `/budgets` Belum Ada di Dashboard
- **Severity:** 🟢 RINGAN
- **File:** [`app/dashboard/page.tsx`](file:///c:/vscdddd/Kuliah/PPK/PraktikumPPK3/duitku-next/app/dashboard/page.tsx)
- **Masalah:** Halaman dashboard sudah memiliki `BudgetCard` yang ada link "Kelola Budget →", tapi tidak ada link navigasi utama di header atau sidebar menuju `/budgets`. User hanya bisa menemukan halaman budget dari card tersebut.
- **Cara Perbaiki:** Tambahkan link navigasi ke `/budgets` di bagian header dashboard (di samping tombol Logout/ThemeToggle), atau buat komponen navigasi sederhana.

### ERR-07: `BudgetCard` Tidak Refresh Saat Dashboard Refresh
- **Severity:** 🟢 RINGAN
- **File:** [`app/dashboard/BudgetCard.tsx`](file:///c:/vscdddd/Kuliah/PPK/PraktikumPPK3/duitku-next/app/dashboard/BudgetCard.tsx#L17-L23)
- **Masalah:** `BudgetCard` fetch data via `useEffect` hanya **sekali** saat mount (dependency array `[]`). Ketika user menekan tombol "🔄 Refresh Data" di `DashboardClient`, data saldo/transaksi di-refresh tapi card budget **tidak ikut refresh**.
- **Cara Perbaiki:** Berikan mekanisme agar `BudgetCard` juga bisa di-trigger refresh — misalnya melalui prop `refreshKey` atau callback dari parent.

### ERR-08: `catch` Error Ditelan Diam-diam di `BudgetCard`
- **Severity:** 🟢 RINGAN
- **File:** [`app/dashboard/BudgetCard.tsx`](file:///c:/vscdddd/Kuliah/PPK/PraktikumPPK3/duitku-next/app/dashboard/BudgetCard.tsx#L21) (baris 21)
- **Masalah:**
  ```typescript
  .catch(() => {})
  ```
  Error dari fetch ditelan tanpa log apapun. Jika API `/api/budgets/current` error, user tidak akan tahu dan card akan tetap menampilkan loading state selamanya — sebenarnya tidak, karena `finally` tetap jalan, tapi `data` tetap `null` sehingga akan menampilkan "Belum ada budget" padahal mungkin ada error jaringan.
- **Cara Perbaiki:** Tambahkan minimal `console.error` di dalam `.catch()`, atau tambahkan state `error` untuk membedakan antara "belum ada budget" dan "gagal fetch".

### ERR-09: `POST /api/budgets` — TypeScript `any` di Catch
- **Severity:** 🟢 RINGAN
- **File:** [`app/api/budgets/route.ts`](file:///c:/vscdddd/Kuliah/PPK/PraktikumPPK3/duitku-next/app/api/budgets/route.ts#L96) (baris 96)
- **Masalah:** `catch (error: any)` menggunakan tipe `any` yang melanggar best practice TypeScript. ESLint mungkin akan menandai ini.
- **Cara Perbaiki:** Ganti dengan pola yang sudah digunakan di file `[id]/route.ts`:
  ```typescript
  catch (error: unknown) {
      if (typeof error === "object" && error !== null && "code" in error && (error as { code: string }).code === "23505") { ... }
  }
  ```

---

## 📋 RINGKASAN

| ID | Severity | File Utama | Masalah |
|---|---|---|---|
| ERR-01 | 🔴 KRITIS | `lib/db.ts` | PostgreSQL tidak jalan / tidak terhubung |
| ERR-02 | 🔴 KRITIS | `.env` | File `.env` tidak ada |
| ERR-03 | 🟡 SEDANG | `dashboard/page.tsx`, `api/dashboard` | `CREATE TABLE` di setiap request |
| ERR-04 | 🟡 SEDANG | `dashboard/page.tsx`, `api/dashboard` | Duplikasi logika query dashboard |
| ERR-05 | 🟡 SEDANG | `api/dashboard/route.ts` | Hardcoded fallback test user |
| ERR-06 | 🟢 RINGAN | `dashboard/page.tsx` | Navigasi ke `/budgets` kurang jelas |
| ERR-07 | 🟢 RINGAN | `BudgetCard.tsx` | Card budget tidak ikut refresh |
| ERR-08 | 🟢 RINGAN | `BudgetCard.tsx` | Error ditelan diam-diam |
| ERR-09 | 🟢 RINGAN | `api/budgets/route.ts` | TypeScript `any` di catch |

**Total: 2 kritis, 3 sedang, 4 ringan**
