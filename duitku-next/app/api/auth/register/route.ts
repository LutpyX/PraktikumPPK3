import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import pool from "@/lib/db";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const { name, email, password, confirmPassword } = body;

        // Validasi field
        if (!name || !email || !password || !confirmPassword) {
            return NextResponse.json(
                { message: "Semua field wajib diisi." },
                { status: 400 }
            );
        }

        // Validasi password
        if (password.length < 8) {
            return NextResponse.json(
                { message: "Password minimal 8 karakter." },
                { status: 400 }
            );
        }

        if (password !== confirmPassword) {
            return NextResponse.json(
                { message: "Password dan konfirmasi password tidak sama." },
                { status: 400 }
            );
        }

        // Cek email
        const existingUser = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [email]
        );

        if (existingUser.rows.length > 0) {
            return NextResponse.json(
                { message: "Email sudah digunakan." },
                { status: 400 }
            );
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Simpan user
        const result = await pool.query(
            `INSERT INTO users (name, email, password_hash)
             VALUES ($1, $2, $3)
             RETURNING id, name, email, created_at`,
            [name, email, passwordHash]
        );

        return NextResponse.json(
            {
                message: "Registrasi berhasil.",
                user: result.rows[0],
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("Register error:", error);

        return NextResponse.json(
            { message: "Terjadi kesalahan pada server." },
            { status: 500 }
        );
    }
}