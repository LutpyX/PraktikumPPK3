-- ========================================================
-- DUITku - Schema & Seed Data untuk Testing Dashboard (Programmer 3)
-- ========================================================

-- 1. Schema Tabel users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Schema Tabel transactions
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
    amount DECIMAL(15,2) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    transaction_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Data User Dummy
INSERT INTO users (id, name, email, password_hash) 
VALUES (1, 'Test User', 'test@mail.com', '$2b$10$wN18yD5pZz36ZtVf7j5fK.J4E1X9Y2p3rZ8v1d4z9L6w7q0s2a4m6') 
ON CONFLICT (id) DO NOTHING;

-- Reset sequence users jika perlu
SELECT setval('users_id_seq', (SELECT GREATEST(MAX(id), 1) FROM users));

-- 4. Data Transaksi Dummy (Testing Saldo, Pemasukan, Pengeluaran)
INSERT INTO transactions (user_id, type, amount, category, description, transaction_date) VALUES
(1, 'income', 1500000, 'Gaji', 'Gaji part-time September', '2026-09-01'),
(1, 'income', 500000, 'Transfer', 'Kiriman orang tua', '2026-09-05'),
(1, 'expense', 250000, 'Makan', 'Makan minggu ini', '2026-09-07'),
(1, 'expense', 150000, 'Transport', 'Isi bensin', '2026-09-10'),
(1, 'expense', 100000, 'Hiburan', 'Nonton bioskop', '2026-09-12'),
(1, 'income', 200000, 'Freelance', 'Project desain', '2026-09-15'),
(1, 'expense', 350000, 'Belanja', 'Beli buku kuliah', '2026-09-18');
