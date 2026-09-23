import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import LogoutButton from "./LogoutButton";
import ThemeToggle from "./ThemeToggle";

export default async function DashboardPage() {
    const user = await getCurrentUser();

    // Fallback server-side protection (middleware handles redirect normally)
    if (!user) {
        redirect("/login");
    }

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
                            💰 DUITku Dashboard
                        </h1>
                        <p
                            className="mt-1 text-sm"
                            style={{ color: "var(--muted)" }}
                        >
                            Selamat datang, {user.name}!
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <LogoutButton />
                    </div>
                </div>

                {/* User Info Card */}
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
                        Informasi Akun
                    </h2>

                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <span
                                className="text-sm font-medium w-24"
                                style={{ color: "var(--muted)" }}
                            >
                                Nama
                            </span>
                            <span
                                className="text-sm"
                                style={{ color: "var(--foreground)" }}
                            >
                                {user.name}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span
                                className="text-sm font-medium w-24"
                                style={{ color: "var(--muted)" }}
                            >
                                Email
                            </span>
                            <span
                                className="text-sm"
                                style={{ color: "var(--foreground)" }}
                            >
                                {user.email}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span
                                className="text-sm font-medium w-24"
                                style={{ color: "var(--muted)" }}
                            >
                                Bergabung
                            </span>
                            <span
                                className="text-sm"
                                style={{ color: "var(--foreground)" }}
                            >
                                {new Date(user.created_at).toLocaleDateString(
                                    "id-ID",
                                    {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    }
                                )}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Info for Programmer 2 & 3 */}
                <div
                    className="mt-6 rounded-2xl border p-6 shadow-lg"
                    style={{
                        background: "var(--card-bg)",
                        borderColor: "var(--card-border)",
                    }}
                >
                    <h2
                        className="text-lg font-semibold mb-2"
                        style={{ color: "var(--foreground)" }}
                    >
                        🚧 Coming Soon
                    </h2>
                    <p
                        className="text-sm"
                        style={{ color: "var(--muted)" }}
                    >
                        Fitur pencatatan transaksi dan dashboard akan segera
                        hadir. Dikerjakan oleh Programmer 2 dan 3.
                    </p>
                </div>
            </div>
        </main>
    );
}
