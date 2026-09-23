-- =============================================
-- Tabel transactions (Programmer 2)
-- Sesuai skema database Bagian 2 SRS DUITku
-- =============================================
-- Jalankan migration ini SETELAH tabel users sudah dibuat oleh Programmer 1

CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    category VARCHAR(100),
    description TEXT,
    transaction_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index untuk mempercepat query berdasarkan user_id
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);

-- Index untuk mempercepat ORDER BY transaction_date DESC
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(user_id, transaction_date DESC);
