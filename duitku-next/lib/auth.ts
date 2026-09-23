import pool from "@/lib/db";
import { getSession } from "@/lib/session";

export async function getCurrentUser() {
    const session = await getSession();

    if (!session) {
        return null;
    }

    const result = await pool.query(
        `SELECT id, name, email, created_at
         FROM users
         WHERE id = $1`,
        [session.userId]
    );

    return result.rows[0] ?? null;
}