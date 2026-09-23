import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
    try {
        let user = await getCurrentUser();

        // Fallback for development/testing if no active session
        if (!user && process.env.NODE_ENV !== "production") {
            user = { id: 1, name: "Test User", email: "test@mail.com" };
        } else if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Pastikan tabel transactions sudah ada agar tidak error jika migrasi belum dijalankan
        await pool.query(`
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
        `);

        // FR-DASH-02: Total Pemasukan (user yang sedang login)
        const incomeResult = await pool.query(
            `SELECT COALESCE(SUM(amount), 0) AS total 
             FROM transactions 
             WHERE user_id = $1 AND type = 'income'`,
            [user.id]
        );
        const totalIncome = Number(incomeResult.rows[0].total);

        // FR-DASH-03: Total Pengeluaran (user yang sedang login)
        const expenseResult = await pool.query(
            `SELECT COALESCE(SUM(amount), 0) AS total 
             FROM transactions 
             WHERE user_id = $1 AND type = 'expense'`,
            [user.id]
        );
        const totalExpense = Number(expenseResult.rows[0].total);

        // FR-DASH-01: Saldo = total_pemasukan - total_pengeluaran
        const balance = totalIncome - totalExpense;

        // FR-DASH-04: 5-10 Transaksi terbaru
        const transactionsResult = await pool.query(
            `SELECT id, type, amount, category, description, transaction_date 
             FROM transactions 
             WHERE user_id = $1 
             ORDER BY transaction_date DESC, id DESC 
             LIMIT 10`,
            [user.id]
        );

        const recentTransactions = transactionsResult.rows.map((row) => ({
            id: row.id,
            type: row.type,
            amount: Number(row.amount),
            category: row.category,
            description: row.description,
            transaction_date: row.transaction_date instanceof Date
                ? row.transaction_date.toISOString().split("T")[0]
                : String(row.transaction_date).split("T")[0],
        }));

        return NextResponse.json({
            balance,
            totalIncome,
            totalExpense,
            recentTransactions,
            user: {
                name: user.name,
            },
        });
    } catch (error) {
        console.error("Dashboard API error:", error);
        return NextResponse.json(
            { error: "Terjadi kesalahan pada server saat mengambil data dashboard." },
            { status: 500 }
        );
    }
}
