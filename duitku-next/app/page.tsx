import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
    const user = await getCurrentUser();

    // Jika sudah login, langsung ke dashboard
    if (user) {
        redirect("/dashboard");
    }

    return (
        <main
            className="flex flex-1 items-center justify-center px-4 py-12"
            style={{ background: "var(--background)" }}
        >
            <div className="text-center">
                <h1
                    className="text-5xl font-bold tracking-tight mb-4"
                    style={{ color: "var(--foreground)" }}
                >
                    💰 DUITku
                </h1>
                <p
                    className="text-lg mb-8 max-w-md mx-auto"
                    style={{ color: "var(--muted)" }}
                >
                    Aplikasi pencatatan keuangan mahasiswa.
                    Catat pemasukan dan pengeluaranmu dengan mudah.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/login"
                        className="rounded-lg px-6 py-3 text-sm font-semibold text-white transition-colors"
                        style={{ background: "var(--primary)" }}
                    >
                        Login
                    </Link>
                    <Link
                        href="/register"
                        className="rounded-lg border px-6 py-3 text-sm font-semibold transition-colors"
                        style={{
                            borderColor: "var(--card-border)",
                            color: "var(--foreground)",
                        }}
                    >
                        Register
                    </Link>
                </div>
            </div>
        </main>
    );
}
