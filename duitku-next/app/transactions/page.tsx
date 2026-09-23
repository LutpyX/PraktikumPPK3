import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import TransactionsClient from "./TransactionsClient";

export default async function TransactionsPage() {
    const user = await getCurrentUser();

    // Proteksi server-side: harus login
    if (!user) {
        redirect("/login");
    }

    return <TransactionsClient userName={user.name} />;
}
