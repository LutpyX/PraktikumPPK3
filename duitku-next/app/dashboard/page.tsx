import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "./LogoutButton";
import ThemeToggle from "./ThemeToggle";
import DashboardClient, { DashboardData } from "./DashboardClient";
import BudgetCard from "./BudgetCard";
import { getDashboardData } from "@/lib/dashboard";

export default async function DashboardPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    let dashboardData: DashboardData;
    try {
        dashboardData = await getDashboardData(user.id, user.name);
    } catch (err) {
        console.error("Error fetching dashboard data:", err);
        dashboardData = {
            balance: 0,
            totalIncome: 0,
            totalExpense: 0,
            recentTransactions: [],
            user: { name: user.name },
        };
    }

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
                        <Link
                            href="/budgets"
                            className="rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors"
                            style={{
                                borderColor: "var(--card-border)",
                                color: "var(--foreground)",
                                background: "var(--input-bg)",
                            }}
                        >
                            📋 Budget
                        </Link>
                        <ThemeToggle />
                        <LogoutButton />
                    </div>
                </div>

                {/* Dashboard Stats & Recent Transactions */}
                <DashboardClient initialData={dashboardData} />

                {/* Budget Bulan Ini */}
                <BudgetCard />

                {/* User Info Card */}
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
