"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

// =============================================
// Tipe data budget sesuai kontrak API
// =============================================
interface Budget {
    id: number;
    month: number;
    year: number;
    amount: string; // DECIMAL dari PostgreSQL dikembalikan sebagai string
    created_at: string;
    updated_at: string;
}

interface BudgetsClientProps {
    userName: string;
}

// =============================================
// Nama bulan dalam bahasa Indonesia
// =============================================
const MONTH_NAMES = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export default function BudgetsClient({ userName }: BudgetsClientProps) {
    // =============================================
    // State
    // =============================================
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    // Form state — default ke bulan dan tahun saat ini
    const [formMonth, setFormMonth] = useState(() => new Date().getMonth() + 1);
    const [formYear, setFormYear] = useState(() => new Date().getFullYear());
    const [formAmount, setFormAmount] = useState("");

    // Edit mode state
    const [editingId, setEditingId] = useState<number | null>(null);

    // =============================================
    // FR-BDG-UI-02 — Ambil semua budget milik user
    // =============================================
    const fetchBudgets = useCallback(async () => {
        try {
            const res = await fetch("/api/budgets");
            const data = await res.json();

            if (res.ok) {
                setBudgets(data.budgets);
            } else {
                setError(data.error || "Gagal mengambil data");
            }
        } catch {
            setError("Gagal terhubung ke server");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBudgets();
    }, [fetchBudgets]);

    // Auto-hide pesan sukses setelah 3 detik
    useEffect(() => {
        if (successMsg) {
            const timer = setTimeout(() => setSuccessMsg(""), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMsg]);

    // Auto-hide pesan error setelah 5 detik
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(""), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    // =============================================
    // Reset form ke state awal
    // =============================================
    function resetForm() {
        setFormMonth(new Date().getMonth() + 1);
        setFormYear(new Date().getFullYear());
        setFormAmount("");
        setEditingId(null);
    }

    // =============================================
    // FR-BDG-UI-01 — Tambah Budget / FR-BDG-UI-03 — Edit Budget
    // =============================================
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setSuccessMsg("");

        // Validasi frontend
        const parsedAmount = parseFloat(formAmount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            setError("Jumlah anggaran harus lebih dari 0");
            return;
        }

        setSubmitting(true);

        try {
            let res: Response;

            if (editingId !== null) {
                // FR-BDG-UI-03 — Update nominal budget
                res = await fetch(`/api/budgets/${editingId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ amount: parsedAmount }),
                });
            } else {
                // FR-BDG-UI-01 — Tambah budget baru
                res = await fetch("/api/budgets", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        month: formMonth,
                        year: formYear,
                        amount: parsedAmount,
                    }),
                });
            }

            const data = await res.json();

            if (res.ok) {
                setSuccessMsg(
                    editingId !== null
                        ? "Budget berhasil diubah!"
                        : "Budget berhasil disimpan!"
                );
                resetForm();
                fetchBudgets(); // Refresh list
            } else {
                setError(data.error || "Gagal menyimpan budget");
            }
        } catch {
            setError("Gagal terhubung ke server");
        } finally {
            setSubmitting(false);
        }
    }

    // =============================================
    // FR-BDG-UI-03 — Mulai mode edit: isi form dengan data budget yang dipilih
    // =============================================
    function handleEdit(budget: Budget) {
        setEditingId(budget.id);
        setFormMonth(budget.month);
        setFormYear(budget.year);
        setFormAmount(parseFloat(budget.amount).toString());
        setError("");
        setSuccessMsg("");

        // Scroll ke form
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    // =============================================
    // FR-BDG-UI-04 — Hapus Budget (dengan konfirmasi)
    // =============================================
    async function handleDelete(id: number) {
        if (!window.confirm("Yakin ingin menghapus budget ini?")) {
            return;
        }

        setError("");
        setSuccessMsg("");

        try {
            const res = await fetch(`/api/budgets/${id}`, {
                method: "DELETE",
            });

            const data = await res.json();

            if (res.ok) {
                setSuccessMsg("Budget berhasil dihapus!");
                fetchBudgets(); // Refresh list

                // Kalau yang dihapus sedang di-edit, reset form
                if (editingId === id) {
                    resetForm();
                }
            } else {
                setError(data.error || "Gagal menghapus budget");
            }
        } catch {
            setError("Gagal terhubung ke server");
        }
    }

    // =============================================
    // Format angka ke mata uang Rupiah
    // =============================================
    function formatCurrency(value: string | number) {
        const num = typeof value === "string" ? parseFloat(value) : value;
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(num);
    }

    // =============================================
    // Generate opsi tahun (tahun ini -2 sampai +2)
    // =============================================
    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

    // =============================================
    // Render
    // =============================================
    return (
        <main
            className="flex flex-1 flex-col px-4 py-8"
            style={{ background: "var(--background)" }}
        >
            <div className="mx-auto w-full max-w-3xl">
                {/* Header */}
                <div
                    className="flex items-center justify-between rounded-2xl border p-6 shadow-lg mb-6"
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
                            💰 Budget Bulanan
                        </h1>
                        <p
                            className="mt-1 text-sm"
                            style={{ color: "var(--muted)" }}
                        >
                            Kelola anggaran pengeluaran bulananmu, {userName}
                        </p>
                    </div>
                    <Link
                        href="/dashboard"
                        className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
                        style={{
                            borderColor: "var(--card-border)",
                            color: "var(--foreground)",
                            background: "var(--input-bg)",
                        }}
                    >
                        ← Dashboard
                    </Link>
                </div>

                {/* Pesan sukses */}
                {successMsg && (
                    <div
                        className="rounded-lg border p-3 mb-4 text-sm font-medium"
                        style={{
                            background: "rgba(34, 197, 94, 0.1)",
                            borderColor: "var(--success)",
                            color: "var(--success)",
                        }}
                    >
                        ✅ {successMsg}
                    </div>
                )}

                {/* Pesan error */}
                {error && (
                    <div
                        className="rounded-lg border p-3 mb-4 text-sm font-medium"
                        style={{
                            background: "rgba(239, 68, 68, 0.1)",
                            borderColor: "var(--danger)",
                            color: "var(--danger)",
                        }}
                    >
                        ❌ {error}
                    </div>
                )}

                {/* Form Tambah / Edit Budget */}
                <div
                    className="rounded-2xl border p-6 shadow-lg mb-6"
                    style={{
                        background: "var(--card-bg)",
                        borderColor: "var(--card-border)",
                    }}
                >
                    <h2
                        className="text-lg font-semibold mb-4"
                        style={{ color: "var(--foreground)" }}
                    >
                        {editingId !== null ? "✏️ Ubah Budget" : "➕ Tambah Budget"}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Baris 1: Bulan + Tahun */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label
                                    htmlFor="month"
                                    className="block text-sm font-medium mb-1"
                                    style={{ color: "var(--foreground)" }}
                                >
                                    Bulan <span style={{ color: "var(--danger)" }}>*</span>
                                </label>
                                <select
                                    id="month"
                                    value={formMonth}
                                    onChange={(e) => setFormMonth(parseInt(e.target.value, 10))}
                                    required
                                    disabled={editingId !== null}
                                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors disabled:opacity-50"
                                    style={{
                                        background: "var(--input-bg)",
                                        borderColor: "var(--input-border)",
                                        color: "var(--foreground)",
                                    }}
                                >
                                    {MONTH_NAMES.map((name, index) => (
                                        <option key={index + 1} value={index + 1}>
                                            {name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label
                                    htmlFor="year"
                                    className="block text-sm font-medium mb-1"
                                    style={{ color: "var(--foreground)" }}
                                >
                                    Tahun <span style={{ color: "var(--danger)" }}>*</span>
                                </label>
                                <select
                                    id="year"
                                    value={formYear}
                                    onChange={(e) => setFormYear(parseInt(e.target.value, 10))}
                                    required
                                    disabled={editingId !== null}
                                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors disabled:opacity-50"
                                    style={{
                                        background: "var(--input-bg)",
                                        borderColor: "var(--input-border)",
                                        color: "var(--foreground)",
                                    }}
                                >
                                    {yearOptions.map((y) => (
                                        <option key={y} value={y}>
                                            {y}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Baris 2: Anggaran */}
                        <div>
                            <label
                                htmlFor="amount"
                                className="block text-sm font-medium mb-1"
                                style={{ color: "var(--foreground)" }}
                            >
                                Anggaran (Rp) <span style={{ color: "var(--danger)" }}>*</span>
                            </label>
                            <input
                                id="amount"
                                type="number"
                                min="1"
                                step="any"
                                placeholder="500000"
                                value={formAmount}
                                onChange={(e) => setFormAmount(e.target.value)}
                                required
                                className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors"
                                style={{
                                    background: "var(--input-bg)",
                                    borderColor: "var(--input-border)",
                                    color: "var(--foreground)",
                                }}
                            />
                        </div>

                        {/* Tombol Submit + Cancel */}
                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="rounded-lg px-5 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-50 cursor-pointer"
                                style={{ background: "var(--primary)" }}
                            >
                                {submitting
                                    ? "Menyimpan..."
                                    : editingId !== null
                                    ? "Simpan Perubahan"
                                    : "Simpan Budget"}
                            </button>

                            {editingId !== null && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="rounded-lg border px-5 py-2 text-sm font-medium transition-colors cursor-pointer"
                                    style={{
                                        borderColor: "var(--card-border)",
                                        color: "var(--foreground)",
                                    }}
                                >
                                    Batal Edit
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Tabel Daftar Budget */}
                <div
                    className="rounded-2xl border p-6 shadow-lg"
                    style={{
                        background: "var(--card-bg)",
                        borderColor: "var(--card-border)",
                    }}
                >
                    <h2
                        className="text-lg font-semibold mb-4"
                        style={{ color: "var(--foreground)" }}
                    >
                        📋 Daftar Budget
                    </h2>

                    {loading ? (
                        <p
                            className="text-sm text-center py-8"
                            style={{ color: "var(--muted)" }}
                        >
                            Memuat data...
                        </p>
                    ) : budgets.length === 0 ? (
                        <p
                            className="text-sm text-center py-8"
                            style={{ color: "var(--muted)" }}
                        >
                            Belum ada budget yang ditetapkan. Mulai atur anggaran bulananmu!
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr
                                        style={{
                                            borderBottom: "2px solid var(--card-border)",
                                        }}
                                    >
                                        <th
                                            className="text-left py-3 px-2 font-semibold"
                                            style={{ color: "var(--foreground)" }}
                                        >
                                            Bulan / Tahun
                                        </th>
                                        <th
                                            className="text-right py-3 px-2 font-semibold"
                                            style={{ color: "var(--foreground)" }}
                                        >
                                            Anggaran
                                        </th>
                                        <th
                                            className="text-center py-3 px-2 font-semibold"
                                            style={{ color: "var(--foreground)" }}
                                        >
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {budgets.map((budget) => (
                                        <tr
                                            key={budget.id}
                                            style={{
                                                borderBottom: "1px solid var(--card-border)",
                                            }}
                                        >
                                            <td
                                                className="py-3 px-2"
                                                style={{ color: "var(--foreground)" }}
                                            >
                                                {MONTH_NAMES[budget.month - 1]} {budget.year}
                                            </td>
                                            <td
                                                className="py-3 px-2 text-right font-mono font-medium"
                                                style={{ color: "var(--foreground)" }}
                                            >
                                                {formatCurrency(budget.amount)}
                                            </td>
                                            <td className="py-3 px-2 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleEdit(budget)}
                                                        className="rounded px-2 py-1 text-xs font-medium transition-colors cursor-pointer"
                                                        style={{
                                                            background: "rgba(59, 130, 246, 0.15)",
                                                            color: "var(--primary)",
                                                        }}
                                                        title="Edit budget"
                                                    >
                                                        ✏️ Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(budget.id)}
                                                        className="rounded px-2 py-1 text-xs font-medium transition-colors cursor-pointer"
                                                        style={{
                                                            background: "rgba(239, 68, 68, 0.15)",
                                                            color: "var(--danger)",
                                                        }}
                                                        title="Hapus budget"
                                                    >
                                                        🗑️ Hapus
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
