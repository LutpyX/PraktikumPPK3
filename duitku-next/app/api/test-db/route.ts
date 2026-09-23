import pool from "@/lib/db";

export async function GET() {
    try {
        const result = await pool.query("SELECT NOW()");

        return Response.json({
            success: true,
            message: "PostgreSQL connected!",
            time: result.rows[0].now,
        });
    } catch (error) {
        console.error(error);

        return Response.json(
            {
                success: false,
                message: "Database connection failed",
            },
            { status: 500 }
        );
    }
}
