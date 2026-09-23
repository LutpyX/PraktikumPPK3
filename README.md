# PraktikumPPK4

# Sistem Manajemen Keuangan

Aplikasi web untuk membantu pengguna dalam mengelola dan memantau keuangan pribadi melalui pencatatan transaksi pemasukan dan pengeluaran serta penyajian informasi keuangan dalam bentuk dashboard.

## Fitur Utama

### Authentication

* Registrasi akun
* Login
* Manajemen sesi login
* Logout
* Penyimpanan preferensi melalui cookie
* Identifikasi user yang sedang login

### Transaction Management

* Menambahkan transaksi pemasukan atau pengeluaran
* Melihat riwayat transaksi
* Mengubah transaksi
* Menghapus transaksi
* Validasi data transaksi

### Dashboard

* Melihat saldo
* Melihat total pemasukan
* Melihat total pengeluaran
* Melihat ringkasan riwayat transaksi
* Visualisasi pengeluaran berdasarkan kategori
* Pembaruan dashboard setelah transaksi berubah

## Functional Requirements

| ID         | Fitur                         |
| ---------- | ----------------------------- |
| FR-AUTH-01 | Registrasi Akun               |
| FR-AUTH-02 | Login                         |
| FR-AUTH-03 | Manajemen Sesi Login          |
| FR-AUTH-04 | Logout                        |
| FR-AUTH-05 | Penyimpanan Preferensi Cookie |
| FR-AUTH-06 | Identifikasi User             |
| FR-TRX-01  | Tambah Transaksi              |
| FR-TRX-02  | Riwayat Transaksi             |
| FR-TRX-03  | Edit Transaksi                |
| FR-TRX-04  | Hapus Transaksi               |
| FR-TRX-05  | Validasi Transaksi            |
| FR-DASH-01 | Tampilan Saldo                |
| FR-DASH-02 | Total Pemasukan               |
| FR-DASH-03 | Total Pengeluaran             |
| FR-DASH-04 | Ringkasan Transaksi           |
| FR-DASH-05 | Visualisasi Pengeluaran       |
| FR-DASH-06 | Pembaruan Dashboard           |

## Teknologi

* HTML
* CSS
* JavaScript
* Node.js
* PostgreSQL

## Struktur Fitur

```text
Sistem Manajemen Keuangan
│
├── Authentication
│   ├── Registrasi
│   ├── Login
│   ├── Session
│   ├── Logout
│   └── Cookie Preference
│
├── Transaction
│   ├── Tambah Transaksi
│   ├── Riwayat Transaksi
│   ├── Edit Transaksi
│   ├── Hapus Transaksi
│   └── Validasi Transaksi
│
└── Dashboard
    ├── Saldo
    ├── Pemasukan
    ├── Pengeluaran
    ├── Ringkasan Transaksi
    ├── Visualisasi Pengeluaran
    └── Update Data
```

## Tujuan

Aplikasi ini dikembangkan untuk menyediakan sistem pengelolaan keuangan yang memungkinkan pengguna mencatat transaksi secara terstruktur dan memperoleh gambaran kondisi keuangan melalui informasi dan visualisasi pada dashboard.

## Database

Aplikasi menggunakan **PostgreSQL** sebagai database untuk menyimpan data pengguna dan transaksi.

## Status Pengembangan

Project ini masih dalam tahap pengembangan. Fitur akan dikembangkan secara bertahap berdasarkan Functional Requirements yang telah ditentukan.

## Git Workflow

Pengembangan menggunakan sistem branching untuk menjaga `main` tetap stabil.

```text
main
│
├── feature/*
├── fix/*
├── hotfix/*
└── chore/*
```

Alur pengembangan:

```text
Create Branch
     ↓
Development
     ↓
Testing
     ↓
Commit
     ↓
Push
     ↓
Review
     ↓
Merge ke main
```

Commit menggunakan format **Conventional Commits**:

```text
<type>(<scope>): <deskripsi>
```

Contoh:

```text
feat(auth): add user login
feat(transaction): add transaction form
fix(dashboard): fix balance calculation
```
