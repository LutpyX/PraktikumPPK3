"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setLoading(true);
        setMessage("");
        setIsError(false);
        setIsSuccess(false);

        const form = event.currentTarget;
        const formData = new FormData(form);

        const data = {
            email: formData.get("email"),
            password: formData.get("password"),
        };

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                setMessage(result.message);
                setIsError(true);
                return;
            }

            setMessage(`Login berhasil! Selamat datang, ${result.user.name}.`);
            setIsSuccess(true);

            setTimeout(() => {
                router.push("/dashboard");
            }, 1000);

        } catch (error) {
            console.error(error);
            setMessage("Tidak dapat terhubung ke server.");
            setIsError(true);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="flex flex-1 items-center justify-center px-4 py-12"
              style={{ background: "var(--background)" }}>
            <div
                className="w-full max-w-md rounded-2xl p-8 shadow-lg border"
                style={{
                    background: "var(--card-bg)",
                    borderColor: "var(--card-border)",
                }}
            >
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1
                        className="text-3xl font-bold tracking-tight"
                        style={{ color: "var(--foreground)" }}
                    >
                        💰 DUITku
                    </h1>
                    <p
                        className="mt-2 text-sm"
                        style={{ color: "var(--muted)" }}
                    >
                        Masuk ke akunmu
                    </p>
                </div>

                {/* Message */}
                {message && (
                    <div
                        className={`mb-6 rounded-lg px-4 py-3 text-sm font-medium ${
                            isSuccess
                                ? "bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                                : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                        }`}
                    >
                        {message}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label
                            htmlFor="email"
                            className="mb-1.5 block text-sm font-medium"
                            style={{ color: "var(--foreground)" }}
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            placeholder="nama@email.com"
                            className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors focus:ring-2"
                            style={{
                                background: "var(--input-bg)",
                                borderColor: "var(--input-border)",
                                color: "var(--foreground)",
                            }}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="mb-1.5 block text-sm font-medium"
                            style={{ color: "var(--foreground)" }}
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            placeholder="Masukkan password"
                            className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors focus:ring-2"
                            style={{
                                background: "var(--input-bg)",
                                borderColor: "var(--input-border)",
                                color: "var(--foreground)",
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        style={{
                            background: loading
                                ? "var(--muted)"
                                : "var(--primary)",
                        }}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg
                                    className="h-4 w-4 animate-spin"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                    />
                                </svg>
                                Masuk...
                            </span>
                        ) : (
                            "Login"
                        )}
                    </button>
                </form>

                {/* Link to Register */}
                <p
                    className="mt-6 text-center text-sm"
                    style={{ color: "var(--muted)" }}
                >
                    Belum punya akun?{" "}
                    <Link
                        href="/register"
                        className="font-semibold hover:underline"
                        style={{ color: "var(--primary)" }}
                    >
                        Register di sini
                    </Link>
                </p>
            </div>
        </main>
    );
}