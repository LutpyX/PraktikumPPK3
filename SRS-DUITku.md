# Software Requirements Specification (SRS)
# DUITku — Aplikasi Expense Tracker untuk Mahasiswa

**Versi:** 2.0 (revisi — dipecah per programmer)
**Tanggal:** 23 September 2026

> Dokumen ini disusun supaya **setiap programmer cukup baca bagian miliknya sendiri** (Bagian 3, 4, atau 5) tanpa perlu scroll ke bagian lain. Bagian 1 dan 2 wajib dibaca semua orang karena jadi acuan bersama (skema database & aturan umum).

---

## 1. Ringkasan Proyek (baca semua)

DUITku adalah aplikasi web *Expense Tracker* untuk mahasiswa. Pengguna bisa daftar/login, mencatat pemasukan & pengeluaran, melihat riwayat transaksi, dan melihat ringkasan keuangan (saldo, total pemasukan, total pengeluaran) di dashboard. Setiap pengguna hanya boleh mengakses datanya sendiri.

**Pembagian tugas:**

| Siapa | Ngerjain Apa |
|---|---|
| **Programmer 1** | Register, Login, Logout, Session (biar tidak perlu login ulang terus), Cookie preferensi |
| **Programmer 2** | CRUD transaksi (tambah/ubah/hapus/lihat pemasukan & pengeluaran) |
| **Programmer 3** | Dashboard: saldo, total pemasukan, total pengeluaran, ringkasan riwayat |

**Urutan pengerjaan:** Programmer 1 duluan menyelesaikan tabel `users` + fungsi cek sesi login, karena Programmer 2 & 3 butuh itu untuk tahu "siapa yang sedang login" (`user_id`). Setelah itu Programmer 2 & 3 bisa jalan paralel, tapi Programmer 3 butuh tabel `transactions` dari Programmer 2 sudah fix strukturnya (lihat Bagian 2).

---

## 2. Skema Database Bersama (baca semua — WAJIB disepakati dulu sebelum ngoding)

### Tabel `users` (dibuat oleh Programmer 1)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | INT/UUID (PK) | ID unik pengguna |
| name | VARCHAR | Nama pengguna |
| email/username | VARCHAR (UNIQUE) | Untuk login |
| password_hash | VARCHAR | Password yang sudah di-hash, JANGAN plaintext |
| created_at | TIMESTAMP | Waktu akun dibuat |

### Tabel `transactions` (dibuat oleh Programmer 2)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | INT/UUID (PK) | ID unik transaksi |
| user_id | INT/UUID (FK → users.id) | Pemilik transaksi |
| type | ENUM('income','expense') | Jenis transaksi |
| amount | DECIMAL | Nominal (> 0) |
| category | VARCHAR (nullable) | Kategori (misal: makan, gaji) |
| description | TEXT (nullable) | Catatan |
| transaction_date | DATE | Tanggal transaksi |
| created_at, updated_at | TIMESTAMP | Waktu dibuat/diubah |

### Tabel `sessions` (opsional, dibuat oleh Programmer 1 — hanya kalau tidak pakai JWT)
| Kolom | Tipe | Keterangan |
|---|---|---|
| token | VARCHAR (PK) | Token sesi unik |
| user_id | INT/UUID (FK → users.id) | Pemilik sesi |
| expires_at | TIMESTAMP | Kedaluwarsa sesi |

**Aturan emas untuk Programmer 2 & 3:** JANGAN pernah ambil `user_id` dari input/parameter yang dikirim client. Selalu ambil `user_id` dari sesi login yang sudah divalidasi Programmer 1 (misal lewat fungsi `getCurrentUser()`). Ini supaya pengguna A tidak bisa lihat/ubah data pengguna B.

---

## 3. PAKET TUGAS — PROGRAMMER 1: Autentikasi, Sesi & Preferensi

### Yang harus kamu bangun
1. **Halaman/endpoint Register** — form isi nama, email/username, password, konfirmasi password.
2. **Halaman/endpoint Login** — form email/username + password.
3. **Mekanisme sesi login** — supaya pengguna tidak perlu login ulang tiap buka aplikasi, selama sesi belum kedaluwarsa.
4. **Logout** — mengakhiri sesi.
5. **Cookie preferensi** — minimal 1 preferensi pengguna disimpan di cookie (contoh: dark/light mode, mata uang default, atau urutan default riwayat transaksi — pilih salah satu).
6. **Fungsi/middleware `getCurrentUser()`** (atau nama lain sesuai kesepakatan tim) — dipakai Programmer 2 & 3 untuk tahu siapa yang sedang login.

### Detail kebutuhan fungsional

**FR-AUTH-01 — Registrasi**
- Input: nama, email/username, password, konfirmasi password.
- Validasi: email/username belum dipakai, password minimal 8 karakter.
- Password WAJIB di-hash (bcrypt/argon2) sebelum disimpan ke tabel `users`.
- Output: akun tersimpan → arahkan ke login (atau auto-login).
- Error: tampilkan pesan kalau email/username sudah dipakai atau input tidak valid.

**FR-AUTH-02 — Login**
- Input: email/username, password.
- Proses: cocokkan dengan data di `users`. Kalau cocok → buat sesi (token/JWT/session server).
- Output: arahkan ke dashboard, sesi tersimpan di cookie (HttpOnly, Secure).
- Error: kalau salah, tampilkan pesan generik ("email atau password salah") — jangan bilang spesifik mana yang salah.

**FR-AUTH-03 — Sesi bertahan (session persistence)**
- Sesi harus tetap aktif walau tab/browser ditutup-buka lagi, selama belum kedaluwarsa (contoh: 7 hari).
- Buat middleware yang cek validitas sesi di setiap request ke endpoint yang butuh login.
- Kalau sesi habis/tidak valid → redirect ke halaman login.

**FR-AUTH-04 — Logout**
- Hapus/invalidasi sesi di server + hapus cookie sesi di browser.

**FR-AUTH-05 — Cookie preferensi**
- Simpan minimal 1 preferensi pengguna di cookie (bukan di database), contoh `pref_theme=dark`, masa berlaku ~30 hari.
- Saat pengguna ubah preferensi → update cookie.
- Saat aplikasi dibuka lagi → preferensi otomatis diterapkan dari cookie.

**FR-AUTH-06 — Proteksi antar pengguna**
- Sediakan fungsi yang bisa dipanggil Programmer 2 & 3 untuk ambil `user_id` dari sesi yang sedang login (bukan dari input client).

### Checklist "selesai" untuk Programmer 1
- [ ] Tabel `users` (dan `sessions` kalau perlu) sudah dibuat.
- [ ] Register & Login jalan dan password ke-hash.
- [ ] Sesi bertahan tanpa perlu login ulang selama belum expired.
- [ ] Logout menghapus sesi dengan benar.
- [ ] Minimal 1 preferensi tersimpan & diterapkan lewat cookie.
- [ ] Fungsi `getCurrentUser()` siap dipakai/di-share ke Programmer 2 & 3.

---

## 4. PAKET TUGAS — PROGRAMMER 2: CRUD Transaksi

> Prasyarat: tunggu Programmer 1 selesai fungsi cek sesi login (`getCurrentUser()`), karena semua fitur di bawah ini butuh tahu siapa yang sedang login.

### Yang harus kamu bangun
1. **Tambah transaksi** (pemasukan/pengeluaran).
2. **Lihat riwayat transaksi** milik pengguna yang login.
3. **Ubah transaksi** milik sendiri.
4. **Hapus transaksi** milik sendiri.
5. **Validasi input** transaksi (jumlah, jenis, tanggal).

### Detail kebutuhan fungsional

**FR-TRX-01 — Tambah Transaksi**
- Input: jenis (`income`/`expense`), jumlah, kategori (opsional), tanggal, catatan (opsional).
- Validasi: jumlah harus angka > 0; jenis harus `income` atau `expense`.
- Simpan dengan `user_id` dari sesi aktif (dari Programmer 1) — JANGAN dari input client.
- Output: transaksi baru langsung muncul di riwayat.

**FR-TRX-02 — Lihat Riwayat Transaksi**
- Ambil semua transaksi dengan `user_id` = pengguna yang login.
- Urutkan default: terbaru dulu (atau ikuti preferensi cookie kalau Programmer 1 sediakan filter default).
- Tampilkan: tanggal, jenis, kategori, jumlah, catatan.
- Nice to have (kalau sempat): filter berdasarkan rentang tanggal / jenis.

**FR-TRX-03 — Ubah Transaksi**
- Input: ID transaksi + field yang mau diubah.
- WAJIB cek dulu: transaksi ini benar milik pengguna yang login? Kalau bukan → tolak (403/404).
- Update data ke database.

**FR-TRX-04 — Hapus Transaksi**
- Cek kepemilikan sama seperti FR-TRX-03 sebelum hapus.
- Disarankan ada konfirmasi di frontend sebelum benar-benar hapus.
- Boleh hard delete atau soft delete (tandai nonaktif) — sepakati dengan tim.

**FR-TRX-05 — Validasi Data**
- `amount` > 0.
- `type` hanya `income` atau `expense`.
- `transaction_date` tidak boleh kosong, format tanggal valid.

### Checklist "selesai" untuk Programmer 2
- [ ] Tabel `transactions` sudah dibuat sesuai skema Bagian 2.
- [ ] Tambah, lihat, ubah, hapus transaksi semua jalan.
- [ ] Semua endpoint transaksi dicek dulu `user_id`-nya dari sesi login (bukan dari client).
- [ ] Validasi input jumlah/jenis/tanggal sudah jalan di frontend & backend.
- [ ] Struktur tabel `transactions` sudah dikonfirmasi ke Programmer 3 (dia butuh ini untuk dashboard).

---

## 5. PAKET TUGAS — PROGRAMMER 3: Dashboard & Ringkasan Keuangan

> Prasyarat: tunggu struktur tabel `transactions` dari Programmer 2 fix (Bagian 2), dan fungsi cek sesi login dari Programmer 1.

### Yang harus kamu bangun
1. **Tampilan saldo** pengguna.
2. **Total pemasukan** pengguna.
3. **Total pengeluaran** pengguna.
4. **Ringkasan/riwayat singkat** di dashboard (beberapa transaksi terakhir).
5. Update otomatis saat ada perubahan transaksi.

### Detail kebutuhan fungsional

**FR-DASH-01 — Saldo**
- Rumus: `saldo = total_pemasukan - total_pengeluaran`.
- Hitung hanya dari transaksi milik pengguna yang login.
- Tampilkan dalam format mata uang (ikuti preferensi cookie kalau ada dari Programmer 1).

**FR-DASH-02 — Total Pemasukan**
- `SUM(amount)` dari transaksi `type = 'income'` milik pengguna yang login.

**FR-DASH-03 — Total Pengeluaran**
- `SUM(amount)` dari transaksi `type = 'expense'` milik pengguna yang login.

**FR-DASH-04 — Ringkasan Riwayat di Dashboard**
- Tampilkan 5–10 transaksi terbaru sebagai preview.
- Sediakan tombol/link ke halaman riwayat lengkap (punya Programmer 2).

**FR-DASH-05 (opsional, kalau sempat) — Visualisasi**
- Grafik sederhana, misal pie chart pengeluaran per kategori. Bukan prioritas utama, kerjakan kalau FR-DASH-01 s.d. 04 sudah beres.

**FR-DASH-06 — Update Real-time**
- Kalau pengguna tambah/ubah/hapus transaksi (dari fitur Programmer 2), angka saldo & total di dashboard harus ikut berubah (refresh data, bukan angka statis/cache lama).

### Checklist "selesai" untuk Programmer 3
- [ ] Saldo, total pemasukan, total pengeluaran tampil dan hitungannya benar.
- [ ] Hanya menghitung data milik pengguna yang login.
- [ ] Ringkasan riwayat terbaru tampil di dashboard.
- [ ] Dashboard ter-update begitu ada perubahan transaksi.

---

## 6. Kebutuhan Non-Fungsional (baca semua, ringkas)

- **Keamanan**: password di-hash, cookie sesi HttpOnly & Secure, semua CRUD transaksi wajib cek kepemilikan data.
- **Performa**: operasi CRUD & dashboard idealnya merespons < 2 detik.
- **Usability**: info saldo/pemasukan/pengeluaran ditampilkan jelas di bagian atas dashboard.
- **Portabilitas**: bisa diakses via browser modern (Chrome, Firefox, Edge) tanpa install tambahan.

---

## 7. Kriteria Penerimaan Akhir (dicek bareng-bareng sebelum submit)

- [ ] Register & login aman, password ter-hash.
- [ ] Sesi login bertahan sesuai durasi yang disepakati.
- [ ] Minimal 1 preferensi tersimpan via cookie dan diterapkan otomatis.
- [ ] Transaksi bisa ditambah, diubah, dihapus, dilihat — hanya oleh pemiliknya.
- [ ] Pengguna lain tidak bisa akses/ubah data pengguna lain.
- [ ] Dashboard menampilkan saldo, total pemasukan, total pengeluaran secara akurat & ter-update.

---

*Kalau ada perubahan stack teknologi atau kontrak API, update dokumen ini bareng-bareng supaya semua tetap sinkron.*
