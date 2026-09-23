// Frontend Logic Dashboard (Programmer 3)

function formatRupiah(number) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(number);
}

async function loadDashboard() {
    const greetingEl = document.getElementById("greeting");
    const balanceEl = document.getElementById("balanceVal");
    const incomeEl = document.getElementById("incomeVal");
    const expenseEl = document.getElementById("expenseVal");
    const tbody = document.getElementById("transactionBody");

    try {
        const response = await fetch("/api/dashboard");
        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = "/login.html";
                return;
            }
            throw new Error("Gagal mengambil data dari server");
        }

        const data = await response.json();

        // 1. Tampilkan nama user
        if (data.user && data.user.name) {
            greetingEl.textContent = `Selamat datang, ${data.user.name}!`;
        }

        // 2. Tampilkan Saldo, Pemasukan, Pengeluaran (FR-DASH-01, 02, 03)
        balanceEl.textContent = formatRupiah(data.balance);
        incomeEl.textContent = "+" + formatRupiah(data.totalIncome);
        expenseEl.textContent = "-" + formatRupiah(data.totalExpense);

        if (data.balance < 0) {
            balanceEl.style.color = "var(--danger)";
        } else {
            balanceEl.style.color = "var(--text-main)";
        }

        // 3. Tampilkan Riwayat Transaksi (FR-DASH-04)
        tbody.innerHTML = "";

        if (!data.recentTransactions || data.recentTransactions.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 32px;">
                        Belum ada transaksi tercatat.
                    </td>
                </tr>
            `;
            return;
        }

        data.recentTransactions.forEach((tx) => {
            const tr = document.createElement("tr");
            const isIncome = tx.type === "income";

            tr.innerHTML = `
                <td style="color: var(--text-muted); font-size: 13px;">${tx.transaction_date}</td>
                <td>
                    <span class="badge ${isIncome ? "badge-income" : "badge-expense"}">
                        ${isIncome ? "Pemasukan" : "Pengeluaran"}
                    </span>
                </td>
                <td style="font-weight: 500;">${tx.category || "—"}</td>
                <td style="color: var(--text-muted); font-size: 13px;">${tx.description || "—"}</td>
                <td class="text-right" style="font-weight: 600; color: ${isIncome ? "var(--success)" : "var(--danger)"};">
                    ${isIncome ? "+" : "-"}${formatRupiah(tx.amount)}
                </td>
            `;

            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error("Dashboard error:", err);
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; color: var(--danger); padding: 24px;">
                    Terjadi kesalahan saat memuat data. Silakan coba lagi.
                </td>
            </tr>
        `;
    }
}

// Event Listeners (FR-DASH-06 Update Real-time)
document.addEventListener("DOMContentLoaded", () => {
    loadDashboard();

    const refreshBtn = document.getElementById("refreshBtn");
    if (refreshBtn) {
        refreshBtn.addEventListener("click", () => {
            refreshBtn.textContent = "⏳ Memuat...";
            refreshBtn.disabled = true;
            loadDashboard().finally(() => {
                refreshBtn.textContent = "🔄 Refresh";
                refreshBtn.disabled = false;
            });
        });
    }
});
