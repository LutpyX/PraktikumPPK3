import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import pool from "@/lib/db";
import LogoutButton from "./LogoutButton";
import ThemeToggle from "./ThemeToggle";
import DashboardClient, { DashboardData } from "./DashboardClient";

async function getDashboardData(userId: number, userName: string): Promise<DashboardData> {
    try {
        // Pastikan tabel transactions tersedia
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
    } catch (err) {
        console.error("Error fetching dashboard data:", err);
        return {
            balance: 0,
            totalIncome: 0,
            totalExpense: 0,
            recentTransactions: [],
            user: {
                name: userName,
            },
        };
    }
}

export default async function DashboardPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    const dashboardData = await getDashboardData(user.id, user.name);

    return (
        <main
            className="flex flex-1 flex-col px-4 py-8"
            style={{ background: "var(--background)" }}
        >
            <div className="mx-auto w-full max-w-4xl space-y-6">
                {/* Header */}
                <div
                    className="flex flex-wrap items-center justify-between rounded-2xl border p-6 shadow-sm gap-4"
                    style={{
                        background: "var(--card-bg)",
                        borderColor: "var(--card-border)",
                    }}
                >
                    <div>
                        <h1
                            className="text-2xl font-bold tracking-tight"
                            style={{ color: "var(--foreground)" }}
                        >
                            💰 DUITku Dashboard
                        </h1>
                        <p
                            className="mt-1 text-sm"
                            style={{ color: "var(--muted)" }}
                        >
                            Selamat datang, <span className="font-semibold text-foreground">{user.name}</span>!
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <LogoutButton />
                    </div>
                </div>

                {/* Dashboard Stats & Recent Transactions (Programmer 3) */}
                <DashboardClient initialData={dashboardData} />

                {/* User Info Card (Programmer 1) */}
                <div
                    className="rounded-2xl border p-6 shadow-sm"
                    style={{
                        background: "var(--card-bg)",
                        borderColor: "var(--card-border)",
                    }}
                >
                    <h2
                        className="text-base font-semibold mb-4"
                        style={{ color: "var(--foreground)" }}
                    >
                        Informasi Akun
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <span
                                className="text-xs font-medium block"
                                style={{ color: "var(--muted)" }}
                            >
                                Nama
                            </span>
                            <span
                                className="text-sm font-medium"
                                style={{ color: "var(--foreground)" }}
                            >
                                {user.name}
                            </span>
                        </div>
                        <div>
                            <span
                                className="text-xs font-medium block"
                                style={{ color: "var(--muted)" }}
                            >
                                Email
                            </span>
                            <span
                                className="text-sm font-medium"
                                style={{ color: "var(--foreground)" }}
                            >
                                {user.email}
                            </span>
                        </div>
                        <div>
                            <span
                                className="text-xs font-medium block"
                                style={{ color: "var(--muted)" }}
                            >
                                Terdaftar Sejak
                            </span>
                            <span
                                className="text-sm font-medium"
                                style={{ color: "var(--foreground)" }}
                            >
                                {new Date(user.created_at).toLocaleDateString(
                                    "id-ID",
                                    {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    }
                                )}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
