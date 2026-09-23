"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

// =============================================
// Tipe data transaksi sesuai skema database Bagian 2
// =============================================
interface Transaction {
    id: number;
    type: "income" | "expense";
    amount: string;
    category: string | null;
    description: string | null;
    transaction_date: string;
    created_at: string;
    updated_at: string;
}

interface TransactionsClientProps {
    userName: string;
}

export default function TransactionsClient({ userName }: TransactionsClientProps) {
    // =============================================
    // State
    // =============================================
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    // Form state
    const [formType, setFormType] = useState<"income" | "expense">("expense");
    const [formAmount, setFormAmount] = useState("");
    const [formCategory, setFormCategory] = useState("");
    const [formDescription, setFormDescription] = useState("");
    const [formDate, setFormDate] = useState(() => {
        // Default: hari ini (format YYYY-MM-DD)
        return new Date().toISOString().split("T")[0];
    });

    // Edit mode state
    const [editingId, setEditingId] = useState<number | null>(null);

    // =============================================
    // FR-TRX-02 — Ambil semua transaksi user yang login
    // =============================================
    const fetchTransactions = useCallback(async () => {
        try {
            const res = await fetch("/api/transactions");
            const data = await res.json();

            if (res.ok) {
                setTransactions(data.transactions);
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
        fetchTransactions();
    }, [fetchTransactions]);

    // Auto-hide messages
    useEffect(() => {
        if (successMsg) {
            const timer = setTimeout(() => setSuccessMsg(""), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMsg]);

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
        setFormType("expense");
        setFormAmount("");
        setFormCategory("");
        setFormDescription("");
        setFormDate(new Date().toISOString().split("T")[0]);
        setEditingId(null);
    }

    // =============================================
    // FR-TRX-01 — Tambah Transaksi / FR-TRX-03 — Ubah Transaksi
    // =============================================
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setSuccessMsg("");

        // Validasi frontend (FR-TRX-05)
        const parsedAmount = parseFloat(formAmount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            setError("Jumlah harus angka lebih dari 0");
            return;
        }

        if (!["income", "expense"].includes(formType)) {
            setError("Jenis transaksi harus 'income' atau 'expense'");
            return;
        }

        if (!formDate) {
            setError("Tanggal transaksi wajib diisi");
            return;
        }

        setSubmitting(true);

        const payload = {
            type: formType,
            amount: parsedAmount,
            category: formCategory.trim() || null,
            description: formDescription.trim() || null,
            transaction_date: formDate,
        };

        try {
            let res: Response;

            if (editingId !== null) {
                // FR-TRX-03 — Update
                res = await fetch(`/api/transactions/${editingId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
            } else {
                // FR-TRX-01 — Create
                res = await fetch("/api/transactions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
            }

            const data = await res.json();

            if (res.ok) {
                setSuccessMsg(
                    editingId !== null
                        ? "Transaksi berhasil diubah!"
                        : "Transaksi berhasil ditambah!"
                );
                resetForm();
                fetchTransactions(); // Refresh list
            } else {
                setError(data.error || "Gagal menyimpan transaksi");
            }
        } catch {
            setError("Gagal terhubung ke server");
        } finally {
            setSubmitting(false);
        }
    }

    // =============================================
    // FR-TRX-03 — Mulai mode edit: isi form dengan data transaksi yang dipilih
    // =============================================
    function handleEdit(trx: Transaction) {
        setEditingId(trx.id);
        setFormType(trx.type);
        setFormAmount(parseFloat(trx.amount).toString());
        setFormCategory(trx.category || "");
        setFormDescription(trx.description || "");
        setFormDate(trx.transaction_date.split("T")[0]);
        setError("");
        setSuccessMsg("");

        // Scroll ke form
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    // =============================================
    // FR-TRX-04 — Hapus Transaksi (dengan konfirmasi)
    // =============================================
    async function handleDelete(id: number) {
        // Konfirmasi sebelum hapus
        if (!window.confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) {
            return;
        }

        setError("");
        setSuccessMsg("");

        try {
            const res = await fetch(`/api/transactions/${id}`, {
                method: "DELETE",
            });

            const data = await res.json();

            if (res.ok) {
                setSuccessMsg("Transaksi berhasil dihapus!");
                fetchTransactions(); // Refresh list

                // Kalau yang dihapus sedang di-edit, reset form
                if (editingId === id) {
                    resetForm();
                }
            } else {
                setError(data.error || "Gagal menghapus transaksi");
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
    // Format tanggal ke bahasa Indonesia
    // =============================================
    function formatDate(dateStr: string) {
        const date = new Date(dateStr);
        return date.toLocaleDateString("id-ID", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    }

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
                            📝 Transaksi
                        </h1>
                        <p
                            className="mt-1 text-sm"
                            style={{ color: "var(--muted)" }}
                        >
                            Kelola pemasukan & pengeluaran kamu, {userName}
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

                {/* Pesan sukses / error */}
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

                {/* Form Tambah / Edit Transaksi */}
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
                        {editingId !== null ? "✏️ Ubah Transaksi" : "➕ Tambah Transaksi"}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Baris 1: Jenis + Jumlah */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label
                                    htmlFor="type"
                                    className="block text-sm font-medium mb-1"
                                    style={{ color: "var(--foreground)" }}
                                >
                                    Jenis <span style={{ color: "var(--danger)" }}>*</span>
                                </label>
                                <select
                                    id="type"
                                    value={formType}
                                    onChange={(e) =>
                                        setFormType(e.target.value as "income" | "expense")
                                    }
                                    required
                                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors"
                                    style={{
                                        background: "var(--input-bg)",
                                        borderColor: "var(--input-border)",
                                        color: "var(--foreground)",
                                    }}
                                >
                                    <option value="expense">Pengeluaran</option>
                                    <option value="income">Pemasukan</option>
                                </select>
                            </div>
                            <div>
                                <label
                                    htmlFor="amount"
                                    className="block text-sm font-medium mb-1"
                                    style={{ color: "var(--foreground)" }}
                                >
                                    Jumlah (Rp) <span style={{ color: "var(--danger)" }}>*</span>
                                </label>
                                <input
                                    id="amount"
                                    type="number"
                                    min="1"
                                    step="any"
                                    placeholder="50000"
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
                        </div>

                        {/* Baris 2: Kategori + Tanggal */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label
                                    htmlFor="category"
                                    className="block text-sm font-medium mb-1"
                                    style={{ color: "var(--foreground)" }}
                                >
                                    Kategori
                                </label>
                                <input
                                    id="category"
                                    type="text"
                                    placeholder="Makan, Transport, Gaji..."
                                    value={formCategory}
                                    onChange={(e) => setFormCategory(e.target.value)}
                                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors"
                                    style={{
                                        background: "var(--input-bg)",
                                        borderColor: "var(--input-border)",
                                        color: "var(--foreground)",
                                    }}
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="transaction_date"
                                    className="block text-sm font-medium mb-1"
                                    style={{ color: "var(--foreground)" }}
                                >
                                    Tanggal <span style={{ color: "var(--danger)" }}>*</span>
                                </label>
                                <input
                                    id="transaction_date"
                                    type="date"
                                    value={formDate}
                                    onChange={(e) => setFormDate(e.target.value)}
                                    required
                                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors"
                                    style={{
                                        background: "var(--input-bg)",
                                        borderColor: "var(--input-border)",
                                        color: "var(--foreground)",
                                    }}
                                />
                            </div>
                        </div>

                        {/* Baris 3: Catatan */}
                        <div>
                            <label
                                htmlFor="description"
                                className="block text-sm font-medium mb-1"
                                style={{ color: "var(--foreground)" }}
                            >
                                Catatan
                            </label>
                            <textarea
                                id="description"
                                placeholder="Catatan tambahan (opsional)"
                                value={formDescription}
                                onChange={(e) => setFormDescription(e.target.value)}
                                rows={2}
                                className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors resize-none"
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
                                    : "Tambah Transaksi"}
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

                {/* Tabel Riwayat Transaksi */}
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
                        📋 Riwayat Transaksi
                    </h2>

                    {loading ? (
                        <p
                            className="text-sm text-center py-8"
                            style={{ color: "var(--muted)" }}
                        >
                            Memuat data...
                        </p>
                    ) : transactions.length === 0 ? (
                        <p
                            className="text-sm text-center py-8"
                            style={{ color: "var(--muted)" }}
                        >
                            Belum ada transaksi. Mulai catat keuanganmu!
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
                                            Tanggal
                                        </th>
                                        <th
                                            className="text-left py-3 px-2 font-semibold"
                                            style={{ color: "var(--foreground)" }}
                                        >
                                            Jenis
                                        </th>
                                        <th
                                            className="text-left py-3 px-2 font-semibold"
                                            style={{ color: "var(--foreground)" }}
                                        >
                                            Kategori
                                        </th>
                                        <th
                                            className="text-right py-3 px-2 font-semibold"
                                            style={{ color: "var(--foreground)" }}
                                        >
                                            Jumlah
                                        </th>
                                        <th
                                            className="text-left py-3 px-2 font-semibold"
                                            style={{ color: "var(--foreground)" }}
                                        >
                                            Catatan
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
                                    {transactions.map((trx) => (
                                        <tr
                                            key={trx.id}
                                            style={{
                                                borderBottom: "1px solid var(--card-border)",
                                            }}
                                        >
                                            <td
                                                className="py-3 px-2"
                                                style={{ color: "var(--foreground)" }}
                                            >
                                                {formatDate(trx.transaction_date)}
                                            </td>
                                            <td className="py-3 px-2">
                                                <span
                                                    className="inline-block rounded-full px-2 py-0.5 text-xs font-semibold"
                                                    style={{
                                                        background:
                                                            trx.type === "income"
                                                                ? "rgba(34, 197, 94, 0.15)"
                                                                : "rgba(239, 68, 68, 0.15)",
                                                        color:
                                                            trx.type === "income"
                                                                ? "var(--success)"
                                                                : "var(--danger)",
                                                    }}
                                                >
                                                    {trx.type === "income"
                                                        ? "Pemasukan"
                                                        : "Pengeluaran"}
                                                </span>
                                            </td>
                                            <td
                                                className="py-3 px-2"
                                                style={{ color: "var(--muted)" }}
                                            >
                                                {trx.category || "-"}
                                            </td>
                                            <td
                                                className="py-3 px-2 text-right font-mono font-medium"
                                                style={{
                                                    color:
                                                        trx.type === "income"
                                                            ? "var(--success)"
                                                            : "var(--danger)",
                                                }}
                                            >
                                                {trx.type === "income" ? "+" : "-"}
                                                {formatCurrency(trx.amount)}
                                            </td>
                                            <td
                                                className="py-3 px-2 max-w-[150px] truncate"
                                                style={{ color: "var(--muted)" }}
                                                title={trx.description || ""}
                                            >
                                                {trx.description || "-"}
                                            </td>
                                            <td className="py-3 px-2 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleEdit(trx)}
                                                        className="rounded px-2 py-1 text-xs font-medium transition-colors cursor-pointer"
                                                        style={{
                                                            background: "rgba(59, 130, 246, 0.15)",
                                                            color: "var(--primary)",
                                                        }}
                                                        title="Edit transaksi"
                                                    >
                                                        ✏️ Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(trx.id)}
                                                        className="rounded px-2 py-1 text-xs font-medium transition-colors cursor-pointer"
                                                        style={{
                                                            background: "rgba(239, 68, 68, 0.15)",
                                                            color: "var(--danger)",
                                                        }}
                                                        title="Hapus transaksi"
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
