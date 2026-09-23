"use client";

import { useState } from "react";
import Link from "next/link";

export interface Transaction {
    id: number;
    type: "income" | "expense";
    amount: number;
    category: string | null;
    description: string | null;
    transaction_date: string;
}

export interface DashboardData {
    balance: number;
    totalIncome: number;
    totalExpense: number;
    recentTransactions: Transaction[];
    user: {
        name: string;
    };
}

interface DashboardClientProps {
    initialData: DashboardData;
}

export default function DashboardClient({ initialData }: DashboardClientProps) {
    const [data, setData] = useState<DashboardData>(initialData);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<string>(
        new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    );

    function formatRupiah(amount: number): string {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    }

    async function handleRefresh() {
        setIsRefreshing(true);
        try {
            const res = await fetch("/api/dashboard");
            if (res.ok) {
                const refreshed = await res.json();
                setData(refreshed);
                setLastUpdated(
                    new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
                );
            }
        } catch (error) {
            console.error("Gagal memperbarui dashboard:", error);
        } finally {
            setIsRefreshing(false);
        }
    }

    const isSurplus = data.balance >= 0;

    return (
        <div className="space-y-6">
            {/* Action Bar & Refresh */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <span className="text-xs" style={{ color: "var(--muted)" }}>
                        Terakhir diperbarui: {lastUpdated}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-opacity disabled:opacity-50 cursor-pointer"
                        style={{
                            borderColor: "var(--card-border)",
                            color: "var(--foreground)",
                            background: "var(--card-bg)",
                        }}
                        title="Perbarui data saldo dan transaksi terkini"
                    >
                        <span className={isRefreshing ? "animate-spin" : ""}>🔄</span>
                        {isRefreshing ? "Memperbarui..." : "Refresh Data"}
                    </button>
                    <Link
                        href="/transactions"
                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
                        style={{ background: "var(--primary)" }}
                    >
                        <span>➕</span> Tambah Transaksi
                    </Link>
                </div>
            </div>

            {/* Financial Summary Cards (FR-DASH-01, FR-DASH-02, FR-DASH-03) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Saldo Pengguna */}
                <div
                    className="rounded-2xl border p-5 shadow-sm transition-all"
                    style={{
                        background: "var(--card-bg)",
                        borderColor: "var(--card-border)",
                    }}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                            Saldo Pengguna
                        </span>
                        <span
                            className="text-xs font-medium px-2 py-0.5 rounded-full"
                            style={{
                                background: isSurplus ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)",
                                color: isSurplus ? "var(--success)" : "var(--danger)",
                            }}
                        >
                            {isSurplus ? "Surplus" : "Defisit"}
                        </span>
                    </div>
                    <div className="mt-3">
                        <div
                            className="text-2xl font-bold tracking-tight"
                            style={{ color: isSurplus ? "var(--foreground)" : "var(--danger)" }}
                        >
                            {formatRupiah(data.balance)}
                        </div>
                        <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
                            Pemasukan dikurangi pengeluaran
                        </p>
                    </div>
                </div>

                {/* Total Pemasukan */}
                <div
                    className="rounded-2xl border p-5 shadow-sm transition-all"
                    style={{
                        background: "var(--card-bg)",
                        borderColor: "var(--card-border)",
                    }}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                            Total Pemasukan
                        </span>
                        <span className="text-base">📈</span>
                    </div>
                    <div className="mt-3">
                        <div
                            className="text-2xl font-bold tracking-tight"
                            style={{ color: "var(--success)" }}
                        >
                            +{formatRupiah(data.totalIncome)}
                        </div>
                        <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
                            Total pemasukan tercatat
                        </p>
                    </div>
                </div>

                {/* Total Pengeluaran */}
                <div
                    className="rounded-2xl border p-5 shadow-sm transition-all"
                    style={{
                        background: "var(--card-bg)",
                        borderColor: "var(--card-border)",
                    }}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                            Total Pengeluaran
                        </span>
                        <span className="text-base">📉</span>
                    </div>
                    <div className="mt-3">
                        <div
                            className="text-2xl font-bold tracking-tight"
                            style={{ color: "var(--danger)" }}
                        >
                            -{formatRupiah(data.totalExpense)}
                        </div>
                        <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
                            Total pengeluaran tercatat
                        </p>
                    </div>
                </div>
            </div>

            {/* Recent Transactions Table (FR-DASH-04) */}
            <div
                className="rounded-2xl border p-6 shadow-sm"
                style={{
                    background: "var(--card-bg)",
                    borderColor: "var(--card-border)",
                }}
            >
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
                            Riwayat Transaksi Terbaru
                        </h2>
                        <p className="text-xs" style={{ color: "var(--muted)" }}>
                            Menampilkan ringkasan 10 transaksi terakhir
                        </p>
                    </div>
                    <Link
                        href="/transactions"
                        className="text-xs font-medium hover:underline inline-flex items-center gap-1"
                        style={{ color: "var(--primary)" }}
                    >
                        Lihat Riwayat Lengkap →
                    </Link>
                </div>

                {data.recentTransactions.length === 0 ? (
                    <div
                        className="rounded-xl border border-dashed p-8 text-center"
                        style={{ borderColor: "var(--card-border)" }}
                    >
                        <p className="text-sm font-medium" style={{ color: "var(--muted)" }}>
                            Belum ada transaksi tercatat.
                        </p>
                        <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
                            Mulai mencatat pemasukan dan pengeluaran Anda hari ini!
                        </p>
                        <Link
                            href="/transactions"
                            className="mt-4 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
                            style={{ background: "var(--primary)" }}
                        >
                            Tambah Transaksi Pertama
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr
                                    className="border-b text-xs font-semibold uppercase"
                                    style={{
                                        borderColor: "var(--card-border)",
                                        color: "var(--muted)",
                                    }}
                                >
                                    <th className="pb-3 pr-4">Tanggal</th>
                                    <th className="pb-3 px-4">Jenis</th>
                                    <th className="pb-3 px-4">Kategori</th>
                                    <th className="pb-3 px-4">Deskripsi</th>
                                    <th className="pb-3 pl-4 text-right">Jumlah</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ borderColor: "var(--card-border)" }}>
                                {data.recentTransactions.map((tx) => {
                                    const isIncome = tx.type === "income";
                                    return (
                                        <tr key={tx.id} className="transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                                            <td className="py-3 pr-4 text-xs" style={{ color: "var(--muted)" }}>
                                                {tx.transaction_date}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span
                                                    className="inline-block rounded-full px-2 py-0.5 text-xs font-medium"
                                                    style={{
                                                        background: isIncome
                                                            ? "rgba(34, 197, 94, 0.15)"
                                                            : "rgba(239, 68, 68, 0.15)",
                                                        color: isIncome ? "var(--success)" : "var(--danger)",
                                                    }}
                                                >
                                                    {isIncome ? "Pemasukan" : "Pengeluaran"}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-sm font-medium" style={{ color: "var(--foreground)" }}>
                                                {tx.category || "—"}
                                            </td>
                                            <td className="py-3 px-4 text-xs truncate max-w-xs" style={{ color: "var(--muted)" }}>
                                                {tx.description || "—"}
                                            </td>
                                            <td
                                                className="py-3 pl-4 text-right font-semibold text-sm"
                                                style={{ color: isIncome ? "var(--success)" : "var(--danger)" }}
                                            >
                                                {isIncome ? "+" : "-"}
                                                {formatRupiah(tx.amount)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
