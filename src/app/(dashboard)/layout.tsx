import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCachedLatestRate } from "@/lib/cache";
import { DashboardShell } from "@/components/layout/DashboardShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // Cached (tag: "rates") — the layout renders on every navigation and
  // must not block on the database, or loading skeletons never appear.
  const latestRate = await getCachedLatestRate();

  return (
    <DashboardShell
      role={(session.user as { role: string }).role}
      user={session.user as { name?: string | null; email?: string | null; role: string }}
      rates={latestRate}
    >
      {children}
    </DashboardShell>
  );
}
