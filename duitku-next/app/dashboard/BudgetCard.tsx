"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface BudgetCurrentData {
    budget: { id: number; month: number; year: number; amount: string } | null;
    spent: number;
    remaining: number;
    percentage: number;
}

export default function BudgetCard() {
    const [data, setData] = useState<BudgetCurrentData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/budgets/current")
            .then(res => res.json())
            .then(setData)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="rounded-2xl border p-5 shadow-sm" style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
                <p className="text-sm" style={{ color: "var(--muted)" }}>Memuat budget...</p>
            </div>
        );
    }
    
    if (!data?.budget) {
        return (
            <div className="rounded-2xl border p-5 shadow-sm" style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
                <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--foreground)" }}>Budget Bulanan</h2>
                <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
                    Belum ada budget untuk bulan ini.<br />
                    Atur anggaran pengeluaranmu!
                </p>
                <Link href="/budgets" className="text-xs font-medium hover:underline" style={{ color: "var(--primary)" }}>
                    Atur Budget Sekarang →
                </Link>
            </div>
        );
    }

    const budgetAmount = Number(data.budget.amount);
    const percentage = data.percentage;
    const barColor = percentage > 90 ? "var(--danger)"
                   : percentage >= 75 ? "#f59e0b"
                   : "var(--success)";
    const isOver = data.remaining < 0;

    function formatRupiah(n: number) {
        return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
    }

    const monthNames = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

    return (
        <div className="rounded-2xl border p-5 shadow-sm" style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
            {/* Header: Bulan + Badge */}
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                    Budget {monthNames[data.budget.month - 1]} {data.budget.year}
                </span>
                {isOver && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(239, 68, 68, 0.15)", color: "var(--danger)" }}>
                        ⚠️ Over Budget
                    </span>
                )}
            </div>

            {/* Nominal anggaran */}
            <div className="mt-2 text-2xl font-bold tracking-tight" style={{ color: "var(--foreground)" }}>
                {formatRupiah(budgetAmount)}
            </div>

            {/* Progress bar */}
            <div className="mt-3 w-full rounded-full h-3" style={{ background: "var(--input-bg)" }}>
                <div className="h-3 rounded-full transition-all duration-500"
                     style={{ width: `${Math.min(percentage, 100)}%`, background: barColor }} />
            </div>
            <p className="mt-1 text-xs text-right" style={{ color: barColor }}>
                {percentage}% terpakai
            </p>

            {/* Terpakai + Sisa */}
            <div className="mt-3 grid grid-cols-2 gap-4">
                <div>
                    <span className="text-xs font-semibold uppercase tracking-wider block" style={{ color: "var(--muted)" }}>Terpakai</span>
                    <span className="text-sm font-semibold" style={{ color: "var(--danger)" }}>
                        {formatRupiah(data.spent)}
                    </span>
                </div>
                <div className="text-right">
                    <span className="text-xs font-semibold uppercase tracking-wider block" style={{ color: "var(--muted)" }}>
                        {isOver ? "Melebihi" : "Sisa"}
                    </span>
                    <span className="text-sm font-semibold" style={{ color: isOver ? "var(--danger)" : "var(--success)" }}>
                        {isOver ? "-" : ""}{formatRupiah(Math.abs(data.remaining))}
                    </span>
                </div>
            </div>

            {/* Link ke halaman budget */}
            <div className="mt-4 text-right">
                <Link href="/budgets" className="text-xs font-medium hover:underline" style={{ color: "var(--primary)" }}>
                    Kelola Budget →
                </Link>
            </div>
        </div>
    );
}
