import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// =============================================
// FR-BDG-03 — PUT /api/budgets/:id
// Ubah nominal budget milik sendiri
// WAJIB cek kepemilikan: budget ini milik user yang login?
// =============================================
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getCurrentUser();

    if (!user) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const { id } = await params;
    const budgetId = parseInt(id, 10);

    if (isNaN(budgetId)) {
        return NextResponse.json(
            { error: "ID tidak valid" },
            { status: 400 }
        );
    }

    try {
        // Cek kepemilikan: budget harus milik user yang login
        const existing = await pool.query(
            `SELECT id, user_id FROM budgets WHERE id = $1`,
            [budgetId]
        );

        if (existing.rows.length === 0) {
            return NextResponse.json(
                { error: "Budget tidak ditemukan" },
                { status: 404 }
            );
        }

        if (existing.rows[0].user_id !== user.id) {
            return NextResponse.json(
                { error: "Akses ditolak" },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { amount } = body;
        const parsedAmount = parseFloat(amount);

        if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
            return NextResponse.json(
                { error: "Jumlah anggaran harus lebih dari 0" },
                { status: 400 }
            );
        }

        const result = await pool.query(
            `UPDATE budgets
             SET amount = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id = $2 AND user_id = $3
             RETURNING id, month, year, amount, created_at, updated_at`,
            [parsedAmount, budgetId, user.id]
        );

        return NextResponse.json({ budget: result.rows[0] });
    } catch (error) {
        console.error("PUT /api/budgets/:id error:", error);
        return NextResponse.json(
            { error: "Gagal mengubah budget" },
            { status: 500 }
        );
    }
}

// =============================================
// FR-BDG-04 — DELETE /api/budgets/:id
// Hapus budget milik sendiri (hard delete)
// WAJIB cek kepemilikan sebelum hapus
// =============================================
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getCurrentUser();

    if (!user) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const { id } = await params;
    const budgetId = parseInt(id, 10);

    if (isNaN(budgetId)) {
        return NextResponse.json(
            { error: "ID tidak valid" },
            { status: 400 }
        );
    }

    try {
        // Cek kepemilikan: budget harus milik user yang login
        const existing = await pool.query(
            `SELECT id, user_id FROM budgets WHERE id = $1`,
            [budgetId]
        );

        if (existing.rows.length === 0) {
            return NextResponse.json(
                { error: "Budget tidak ditemukan" },
                { status: 404 }
            );
        }

        if (existing.rows[0].user_id !== user.id) {
            return NextResponse.json(
                { error: "Akses ditolak" },
                { status: 403 }
            );
        }

        // Hard delete
        await pool.query(
            `DELETE FROM budgets WHERE id = $1 AND user_id = $2`,
            [budgetId, user.id]
        );

        return NextResponse.json({ message: "Budget berhasil dihapus" });
    } catch (error) {
        console.error("DELETE /api/budgets/:id error:", error);
        return NextResponse.json(
            { error: "Gagal menghapus budget" },
            { status: 500 }
        );
    }
}
