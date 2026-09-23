const express = require("express");
const router = express.Router();

let pool;
try {
    pool = require("../db/database");
} catch {
    // Fallback jika belum di-import dari db/database
}

// =============================================
// MOCK — HAPUS setelah Programmer 1 selesai
// Ganti dengan: const { getCurrentUser, authRequired } = require("../middleware/auth");
// =============================================
function getCurrentUser(req) {
    return { id: 1, name: "Test User", email: "test@mail.com" };
}
function authRequired(req, res, next) {
    req.user = getCurrentUser(req);
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    next();
}
// =============================================

// GET /api/dashboard
router.get("/dashboard", authRequired, async (req, res) => {
    try {
        const userId = req.user.id;

        // FR-DASH-02: Total Pemasukan
        const incomeRes = await pool.query(
            `SELECT COALESCE(SUM(amount), 0) AS total 
             FROM transactions 
             WHERE user_id = $1 AND type = 'income'`,
            [userId]
        );
        const totalIncome = Number(incomeRes.rows[0]?.total ?? 0);

        // FR-DASH-03: Total Pengeluaran
        const expenseRes = await pool.query(
            `SELECT COALESCE(SUM(amount), 0) AS total 
             FROM transactions 
             WHERE user_id = $1 AND type = 'expense'`,
            [userId]
        );
        const totalExpense = Number(expenseRes.rows[0]?.total ?? 0);

        // FR-DASH-01: Saldo = pemasukan - pengeluaran
        const balance = totalIncome - totalExpense;

        // FR-DASH-04: 5-10 Transaksi terbaru
        const txRes = await pool.query(
            `SELECT id, type, amount, category, description, transaction_date 
             FROM transactions 
             WHERE user_id = $1 
             ORDER BY transaction_date DESC, id DESC 
             LIMIT 10`,
            [userId]
        );

        const recentTransactions = txRes.rows.map((row) => ({
            id: row.id,
            type: row.type,
            amount: Number(row.amount),
            category: row.category,
            description: row.description,
            transaction_date: row.transaction_date instanceof Date
                ? row.transaction_date.toISOString().split("T")[0]
                : String(row.transaction_date).split("T")[0],
        }));

        res.json({
            balance,
            totalIncome,
            totalExpense,
            recentTransactions,
            user: {
                name: req.user.name,
            },
        });
    } catch (err) {
        console.error("Dashboard error:", err);
        res.status(500).json({ error: "Terjadi kesalahan server saat mengambil data dashboard" });
    }
});

module.exports = router;
