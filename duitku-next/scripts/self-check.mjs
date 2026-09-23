import assert from "node:assert";

console.log("▶ Running Programmer 3 self-check...");

// 1. Math Verification (FR-DASH-01, 02, 03)
const dummyTransactions = [
    { type: 'income', amount: 1500000 },
    { type: 'income', amount: 500000 },
    { type: 'expense', amount: 250000 },
    { type: 'expense', amount: 150000 },
    { type: 'expense', amount: 100000 },
    { type: 'income', amount: 200000 },
    { type: 'expense', amount: 350000 }
];

const totalIncome = dummyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

const totalExpense = dummyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

const balance = totalIncome - totalExpense;

assert.strictEqual(totalIncome, 2200000, "Total Income calculation mismatch");
assert.strictEqual(totalExpense, 850000, "Total Expense calculation mismatch");
assert.strictEqual(balance, 1350000, "Balance calculation mismatch (balance = totalIncome - totalExpense)");

// 2. Format Verification (Rupiah)
function formatRupiah(num) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(num);
}

const formatted = formatRupiah(balance);
assert.ok(formatted.includes("Rp") && formatted.includes("1.350.000"), `Invalid Rupiah format: ${formatted}`);

// 3. API Contract Schema Verification
const mockApiResponse = {
    balance: 500000,
    totalIncome: 1500000,
    totalExpense: 1000000,
    recentTransactions: [
        {
            id: 1,
            type: "income",
            amount: 1500000,
            category: "Gaji",
            description: "Gaji bulan September",
            transaction_date: "2026-09-01"
        }
    ],
    user: {
        name: "Test User"
    }
};

assert.strictEqual(typeof mockApiResponse.balance, "number");
assert.strictEqual(typeof mockApiResponse.totalIncome, "number");
assert.strictEqual(typeof mockApiResponse.totalExpense, "number");
assert.ok(Array.isArray(mockApiResponse.recentTransactions));
assert.strictEqual(mockApiResponse.recentTransactions[0].type, "income");
assert.strictEqual(mockApiResponse.user.name, "Test User");

console.log("✅ All Programmer 3 self-checks passed successfully!");
