import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import pool from "@/lib/db";
import { createSession } from "@/lib/session";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const { email, password } = body;

        // Validasi input
        if (!email || !password) {
            return NextResponse.json(
                {
                    message: "Email atau password salah.",
                },
                { status: 401 }
            );
        }

        // Cari user berdasarkan email
        const result = await pool.query(
            `SELECT id, name, email, password_hash
             FROM users
             WHERE email = $1`,
            [email]
        );

        const user = result.rows[0];

        // User tidak ditemukan
        if (!user) {
            return NextResponse.json(
                {
                    message: "Email atau password salah.",
                },
                { status: 401 }
            );
        }

        // Cocokkan password dengan hash
        const passwordMatch = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatch) {
            return NextResponse.json(
                {
                    message: "Email atau password salah.",
                },
                { status: 401 }
            );
        }

        // Buat session login
        await createSession(user.id);

        return NextResponse.json({
            message: "Login berhasil.",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        });

    } catch (error) {
        console.error("Login error:", error);

        return NextResponse.json(
            {
                message: "Terjadi kesalahan pada server.",
            },
            { status: 500 }
        );
    }
}