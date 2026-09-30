import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import BudgetsClient from "./BudgetsClient";

export default async function BudgetsPage() {
    const user = await getCurrentUser();

    // Proteksi server-side: harus login
    if (!user) {
        redirect("/login");
    }

    return <BudgetsClient userName={user.name} />;
}
