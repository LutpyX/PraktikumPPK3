import pool from "@/lib/db";

// =============================================
// Helper: Ambil data dashboard untuk user tertentu
// Digunakan oleh page.tsx (SSR) dan api/dashboard/route.ts (AJAX refresh)
// =============================================

export interface DashboardResult {
    balance: number;
    totalIncome: number;
    totalExpense: number;
    recentTransactions: {
        id: number;
        type: string;
        amount: number;
        category: string | null;
        description: string | null;
        transaction_date: string;
    }[];
    user: {
        name: string;
    };
}

export async function getDashboardData(userId: number, userName: string): Promise<DashboardResult> {
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

    // FR-DASH-04: Ringkasan 10 transaksi terbaru
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

    return {
        balance,
        totalIncome,
        totalExpense,
        recentTransactions,
        user: {
            name: userName,
        },
    };
}
