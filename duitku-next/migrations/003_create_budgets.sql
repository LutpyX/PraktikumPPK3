-- =============================================
-- Migrasi: Tabel budgets (Budget Bulanan)
-- Programmer 1 — Sesuai SRS DUITku Fitur Budget Bulanan
-- Jalankan di awal sesi, setelah tabel users sudah ada
-- =============================================

CREATE TABLE IF NOT EXISTS budgets (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    month INT NOT NULL CHECK (month >= 1 AND month <= 12),
    year INT NOT NULL CHECK (year >= 2020 AND year <= 2100),
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, month, year)
);

-- Index untuk mempercepat lookup budget per user per bulan
CREATE INDEX IF NOT EXISTS idx_budgets_user_month ON budgets(user_id, year, month);
