import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// =============================================
// FR-BDG-05 — GET /api/budgets/current
// Ambil budget bulan berjalan + total pengeluaran aktual
// Data pengeluaran dihitung dinamis dari tabel transactions
// =============================================
export async function GET() {
    const user = await getCurrentUser();

    if (!user) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const now = new Date();
        const currentMonth = now.getMonth() + 1; // 1-based (1–12)
        const currentYear = now.getFullYear();

        // 1. Ambil budget bulan ini
        const budgetResult = await pool.query(
            `SELECT id, month, year, amount
             FROM budgets
             WHERE user_id = $1 AND month = $2 AND year = $3`,
            [user.id, currentMonth, currentYear]
        );

        const budget = budgetResult.rows[0] || null;

        // 2. Hitung total pengeluaran bulan ini (type = 'expense')
        const spentResult = await pool.query(
            `SELECT COALESCE(SUM(amount), 0) AS total_spent
             FROM transactions
             WHERE user_id = $1
               AND type = 'expense'
               AND EXTRACT(MONTH FROM transaction_date) = $2
               AND EXTRACT(YEAR FROM transaction_date) = $3`,
            [user.id, currentMonth, currentYear]
        );

        const spent = Number(spentResult.rows[0].total_spent);
        const budgetAmount = budget ? Number(budget.amount) : 0;

        // 3. Hitung remaining dan percentage
        return NextResponse.json({
            budget,
            spent,
            remaining: budget ? budgetAmount - spent : 0,
            percentage: budget && budgetAmount > 0
                ? Math.round((spent / budgetAmount) * 100)
                : 0,
        });
    } catch (error) {
        console.error("GET /api/budgets/current error:", error);
        return NextResponse.json(
            { error: "Gagal mengambil data budget" },
            { status: 500 }
        );
    }
}
