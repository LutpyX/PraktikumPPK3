"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ThemeToggle() {
    const router = useRouter();
    const [theme, setTheme] = useState<"light" | "dark">("light");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Read theme from cookie on mount
        const cookieTheme = document.cookie
            .split("; ")
            .find((row) => row.startsWith("duitku_theme="))
            ?.split("=")[1];

        if (cookieTheme === "dark" || cookieTheme === "light") {
            setTheme(cookieTheme);
        }
    }, []);

    async function toggleTheme() {
        const newTheme = theme === "light" ? "dark" : "light";

        setLoading(true);

        try {
            await fetch("/api/auth/preference", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ theme: newTheme }),
            });

            setTheme(newTheme);

            // Update the html class immediately for instant feedback
            document.documentElement.classList.toggle(
                "dark",
                newTheme === "dark"
            );

            router.refresh();
        } catch (error) {
            console.error("Theme toggle error:", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            onClick={toggleTheme}
            disabled={loading}
            className="rounded-lg border px-3 py-2 text-sm transition-colors disabled:opacity-50 cursor-pointer"
            style={{
                borderColor: "var(--card-border)",
                color: "var(--foreground)",
                background: "var(--input-bg)",
            }}
            title={`Ganti ke mode ${theme === "light" ? "gelap" : "terang"}`}
        >
            {theme === "light" ? "🌙" : "☀️"}
        </button>
    );
}
