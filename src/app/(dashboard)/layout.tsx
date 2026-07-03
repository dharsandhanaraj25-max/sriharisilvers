import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { DashboardShell } from "@/components/layout/DashboardShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const latestRate = await prisma.silverRate.findFirst({ orderBy: { date: "desc" } });

  return (
    <DashboardShell
      role={(session.user as { role: string }).role}
      user={session.user as { name?: string | null; email?: string | null; role: string }}
      rates={latestRate ? {
        rate999: latestRate.rate999,
        rate925: latestRate.rate925,
        rate916: latestRate.rate916,
        rate875: latestRate.rate875,
        rate800: latestRate.rate800,
      } : null}
    >
      {children}
    </DashboardShell>
  );
}
